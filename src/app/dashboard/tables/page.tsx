"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  QrCode,
  Eye,
  Plus,
  Download,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { toPng } from "html-to-image";

interface Table {
  id: number;
  name: string;
  status: "free" | "occupied";
  qrCodeHash: string;
  sessionElapsed?: string;
}

import {
  getTablesAction,
  saveTableAction,
  deleteTableAction,
} from "@/app/actions/tables";

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [tableName, setTableName] = useState("");

  const qrRef = useRef<HTMLDivElement>(null);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTablesAction();
      if (data.success) {
        setTables(data.data);
      } else {
        toast.error(data.error || "Error al cargar mesas");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleCreateOrUpdate = async () => {
    if (!tableName.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      setSubmitting(true);

      // La creación ahora delega el hash al backend si es una mesa nueva
      const res = await saveTableAction(
        {
          name: tableName,
          // No enviamos qrCodeHash para que el backend lo genere
        },
        editingTable?.id,
      );

      if (res.success) {
        toast.success(editingTable ? "Mesa actualizada" : "Mesa creada");
        setIsTableModalOpen(false);
        fetchTables();
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      const data = await deleteTableAction(tableToDelete.id);
      if (data.success) {
        toast.success("Mesa eliminada");
        setTableToDelete(null);
        fetchTables();
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current || !qrModalTable) return;

    try {
      // Usamos html-to-image para capturar todo el diseño del card
      const dataUrl = await toPng(qrRef.current, {
        quality: 1.0,
        backgroundColor: "#ffffff",
      });

      // Convertir dataUrl a Blob para evitar advertencias de "URL muy larga" o "No segura"
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `QR-Mesa-${qrModalTable.name}.png`;
      document.body.appendChild(link); // Requerido en algunos navegadores
      link.click();
      document.body.removeChild(link);

      // Limpiar memoria
      URL.revokeObjectURL(blobUrl);

      toast.success("Imagen descargada con éxito");
    } catch (err) {
      toast.error("No se pudo generar la imagen");
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    if (!qrModalTable) return;
    const url = `${window.location.origin}/qr/${qrModalTable.qrCodeHash}`;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(true);
          toast.success("Enlace copiado al portapapeles");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Error al copiar: ", err);
          toast.error("Error al copiar el enlace");
        });
    } else {
      toast.error(
        "La copia al portapapeles requiere una conexión segura (HTTPS)",
      );
    }
  };

  const handleOpenCreate = () => {
    setEditingTable(null);
    setTableName("");
    setIsTableModalOpen(true);
  };

  const handleOpenEdit = (table: Table) => {
    setEditingTable(table);
    setTableName(table.name);
    setIsTableModalOpen(true);
  };

  // Statistics
  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status !== "free").length;
  const freeTables = tables.filter((t) => t.status === "free").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Mesas y QR
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Administra tus mesas, visualiza sesiones activas y genera códigos
            QR.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Crear Nueva Mesa
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total de Mesas
            </CardTitle>
            <div className="p-2 bg-primary/10 rounded-full">
              <QrCode className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTables}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Mesas Ocupadas
            </CardTitle>
            <div className="p-2 bg-red-100 rounded-full">
              <Users className="w-4 h-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {occupiedTables}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Mesas Libres</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-full">
              <QrCode className="w-4 h-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {freeTables}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grilla de Mesas compacta */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            Cargando mesas...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => {
            const isFree = table.status === "free";
            const isOccupied = table.status === "occupied";

            return (
              <Card
                key={table.id}
                className={cn(
                  "py-0 flex flex-col relative overflow-hidden transition-all duration-200 hover:shadow-md border",
                  "border-border",
                )}
              >
                <div
                  className={cn(
                    "p-4 flex flex-col h-full gap-3",
                    isFree && "bg-emerald-50/40",
                    isOccupied && "bg-red-50/40",
                  )}
                >
                  {/* Header: Etiqueta y Menú Opciones */}
                  <div className="flex justify-between items-start">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset bg-white",
                        isFree && "text-emerald-700 ring-emerald-600/30",
                        isOccupied && "text-red-700 ring-red-600/20",
                      )}
                    >
                      <span
                        className={cn(
                          "mr-1.5 h-2 w-2 rounded-full",
                          isFree && "bg-emerald-500",
                          isOccupied && "bg-red-500",
                        )}
                      />
                      {isFree ? "Libre" : "Ocupada"}
                    </span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-42">
                        <DropdownMenuItem onClick={() => handleOpenEdit(table)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span className="whitespace-nowrap">Editar mesa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:bg-red-50 focus:text-red-700"
                          onClick={() => setTableToDelete(table)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span className="whitespace-nowrap">
                            Eliminar mesa
                          </span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Número/Nombre de la Mesa y resúmen */}
                  <div className="flex flex-col items-center justify-center py-2 grow">
                    <span className="text-sm font-semibold text-muted-foreground uppercase opacity-80">
                      Mesa
                    </span>
                    <span
                      className={cn(
                        "text-4xl font-black tracking-tighter mt-1 mb-2 text-center wrap-break-word max-w-full leading-none truncate",
                        isFree && "text-emerald-950",
                        isOccupied && "text-red-950",
                      )}
                    >
                      {table.name}
                    </span>

                    <div className="flex items-center justify-center gap-2 h-5 mt-1">
                      {isOccupied && (
                        <div className="flex items-center text-xs font-semibold text-muted-foreground/80">
                          <span>Sesión activa</span>
                        </div>
                      )}
                      {isFree && (
                        <span className="text-xs font-medium text-muted-foreground/60">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de acción inferiores */}
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "min-w-1/2 h-8 text-xs bg-white/60 hover:bg-white shadow-none",
                        isFree ? "border-emerald-200" : "border-red-200",
                      )}
                      onClick={() => setQrModalTable(table)}
                    >
                      <QrCode className="w-3.5 h-3.5 mr-1.5" />
                      QR
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* MODAL: Crear/Editar Mesa */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>
              {editingTable ? "Editar Mesa" : "Crear Nueva Mesa"}
            </DialogTitle>
            <DialogDescription>
              {editingTable
                ? "Modifica el nombre o identificador de la mesa."
                : "Agrega el nombre o número para identificar la mesa."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tableName">Nombre de la Mesa</Label>
              <Input
                id="tableName"
                type="text"
                placeholder="Ej: 12, Barra A, Terraza 5"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTableModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateOrUpdate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTable ? "Guardar Cambios" : "Guardar Mesa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Eliminar Mesa */}
      <Dialog
        open={!!tableToDelete}
        onOpenChange={(open) => !open && setTableToDelete(null)}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Eliminar Mesa</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la mesa{" "}
              <strong>{tableToDelete?.name}</strong>?
              <br />
              <br />
              Esta acción no se puede deshacer y borrará los datos asociados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-1">
            <Button variant="outline" onClick={() => setTableToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteTable}>
              Eliminar Mesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Código QR - REDISEÑADO SEGÚN SOLICITUD */}
      <Dialog
        open={!!qrModalTable}
        onOpenChange={(open) => !open && setQrModalTable(null)}
      >
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Código QR - Mesa {qrModalTable?.name}</DialogTitle>
            <DialogDescription>
              Escanea el código para el menú digital.
            </DialogDescription>
          </DialogHeader>

          {/* 2. Generación mejorada del QR (Lo que se imprime/descarga) - Más compacto */}
          <div className="flex justify-center p-4 bg-muted/20 rounded-lg mt-3">
            <div
              id="qr-to-print"
              ref={qrRef}
              className="flex flex-col items-center bg-white p-4 shadow-sm border border-neutral-100 w-full max-w-60 text-black rounded-lg"
            >
              <div className="text-center mb-3">
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none mb-1">
                  Escanea para ver
                </p>
                <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight leading-none">
                  Nuestro Menú
                </h3>
              </div>

              <div className="bg-white p-1.5 border border-neutral-50 mb-3">
                <QRCodeCanvas
                  value={`${window.location.origin}/qr/${qrModalTable?.qrCodeHash}`}
                  size={150}
                  level={"H"}
                  includeMargin={false}
                />
              </div>

              <div className="space-y-1 mb-4 w-full text-center">
                <p className="text-[10px] font-bold text-neutral-700">
                  📱 Ordena desde tu celular
                </p>
                <p className="text-[10px] font-bold text-neutral-700">
                  🍔 Sin esperar al camarero
                </p>
              </div>

              <div className="w-full pt-3 border-t border-neutral-100 text-center">
                <p className="text-2xl font-black text-neutral-900 leading-none">
                  {qrModalTable?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 w-full mt-4 pt-4 border-t no-print">
            <div className="flex items-center bg-muted/50 p-1 rounded-md border border-border min-w-0 overflow-hidden">
              <span className="text-[11px] font-medium truncate px-2 text-muted-foreground flex-1 min-w-0">
                {`${window.location.host}/qr/${qrModalTable?.qrCodeHash}`}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 hover:bg-background/50"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-primary" />
                )}
              </Button>
            </div>

            <Button
              type="button"
              size="sm"
              className="h-10 px-4 font-bold shrink-0"
              onClick={handleDownloadQR}
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
