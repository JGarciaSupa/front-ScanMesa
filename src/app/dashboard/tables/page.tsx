"use client";

import { useState, useRef } from "react";
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
import { QrCode, Eye, Plus, Download, Printer, Users, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { cn } from "@/lib/utils";

interface Table {
  id: number;
  name: string;
  status: "free" | "occupied" | "attention";
  qrCodeHash: string;
  sessionElapsed?: string;
}

const mockTables: Table[] = [
  { id: 1, name: "1", status: "free", qrCodeHash: "abc1" },
  { id: 2, name: "2", status: "occupied", sessionElapsed: "45 min", qrCodeHash: "abc2" },
  { id: 3, name: "3", status: "attention", sessionElapsed: "60 min", qrCodeHash: "abc3" },
  { id: 4, name: "Terraza 1", status: "free", qrCodeHash: "abc4" },
  { id: 5, name: "Barra A", status: "occupied", sessionElapsed: "15 min", qrCodeHash: "abc5" },
  { id: 6, name: "Barra B", status: "free", qrCodeHash: "abc6" },
  { id: 7, name: "7", status: "attention", sessionElapsed: "120 min", qrCodeHash: "abc7" },
  { id: 8, name: "VIP", status: "free", qrCodeHash: "abc8" },
];

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
  const [qrModalTable, setQrModalTable] = useState<Table | null>(null);
  const [sessionDrawerTable, setSessionDrawerTable] = useState<Table | null>(null);

  const qrRef = useRef<HTMLDivElement>(null);

  // Statistics
  const totalTables = tables.length;
  const occupiedTables = tables.filter((t) => t.status !== "free").length;
  const freeTables = tables.filter((t) => t.status === "free").length;

  const handleDownloadQR = () => {
    if (!qrRef.current || !qrModalTable) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `QR-${qrModalTable.name}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintQR = () => {
    window.print();
  };

  const handleOpenCreate = () => {
    setEditingTable(null);
    setIsTableModalOpen(true);
  };

  const handleOpenEdit = (table: Table) => {
    setEditingTable(table);
    setIsTableModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Mesas y QR</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Administra tus mesas, visualiza sesiones activas y genera códigos QR.
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
            <CardTitle className="text-sm font-medium">Total de Mesas</CardTitle>
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
            <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
              <Users className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{occupiedTables}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Mesas Libres</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{freeTables}</div>
          </CardContent>
        </Card>
      </div>

      {/* Grilla de Mesas compacta */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {tables.map((table) => {
          const isFree = table.status === "free";
          const isOccupied = table.status === "occupied";
          const isAttention = table.status === "attention";

          return (
            <Card
              key={table.id}
              className={cn(
                "flex flex-col relative overflow-hidden transition-all duration-200 hover:shadow-md border",
                isAttention ? "border-amber-300 dark:border-amber-700 shadow-[0_0_15px_rgba(251,191,36,0.15)]" : "border-border"
              )}
            >
              {/* Fondo tintado de la tarjeta */}
              <div className={cn(
                "p-4 flex flex-col h-full gap-3",
                isFree && "bg-emerald-50/40 dark:bg-emerald-950/20",
                isOccupied && "bg-red-50/40 dark:bg-red-950/20",
                isAttention && "bg-amber-50/40 dark:bg-amber-950/20"
              )}>
                {/* Header: Etiqueta y Menú Opciones */}
                <div className="flex justify-between items-start">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset bg-white dark:bg-black/50",
                    isFree && "text-emerald-700 ring-emerald-600/30 dark:text-emerald-400 dark:ring-emerald-500/30",
                    isOccupied && "text-red-700 ring-red-600/20 dark:text-red-400 dark:ring-red-500/30",
                    isAttention && "text-amber-700 ring-amber-600/30 dark:text-amber-400 dark:ring-amber-500/30"
                  )}>
                    <span className={cn(
                      "mr-1.5 h-2 w-2 rounded-full",
                      isFree && "bg-emerald-500",
                      isOccupied && "bg-red-500",
                      isAttention && "bg-amber-500 animate-pulse"
                    )} />
                    {isFree ? "Libre" : isAttention ? "Atención" : "Ocupada"}
                  </span>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(table)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar mesa
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950" onClick={() => setTableToDelete(table)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar mesa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Número/Nombre de la Mesa y resúmen */}
                <div className="flex flex-col items-center justify-center py-2 flex-grow">
                  <span className="text-sm font-semibold text-muted-foreground uppercase opacity-80">Mesa</span>
                  <span className={cn(
                    "text-4xl font-black tracking-tighter mt-1 mb-2 text-center break-words max-w-full leading-none",
                    isFree && "text-emerald-950 dark:text-emerald-50",
                    isOccupied && "text-red-950 dark:text-red-50",
                    isAttention && "text-amber-950 dark:text-amber-50"
                  )}>
                    {table.name}
                  </span>
                  
                  <div className="flex items-center justify-center gap-2 h-5 mt-1">
                    {!isFree && (
                      <div className="flex items-center text-xs font-semibold text-muted-foreground/80 dark:text-muted-foreground">
                        <span>{table.sessionElapsed} de sesión</span>
                      </div>
                    )}
                    {isFree && (
                      <span className="text-xs font-medium text-muted-foreground/60">Sin pedidos</span>
                    )}
                  </div>
                </div>

                {/* Botones de acción inferiores */}
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "h-8 text-xs bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black shadow-none",
                      isFree && "border-emerald-200 dark:border-emerald-800/50",
                      isOccupied && "border-red-200 dark:border-red-800/50",
                      isAttention && "border-amber-200 dark:border-amber-800/50"
                    )}
                    onClick={() => setSessionDrawerTable(table)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Ver
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={cn(
                      "h-8 text-xs bg-white/60 dark:bg-black/40 hover:bg-white dark:hover:bg-black shadow-none",
                      isFree && "border-emerald-200 dark:border-emerald-800/50",
                      isOccupied && "border-red-200 dark:border-red-800/50",
                      isAttention && "border-amber-200 dark:border-amber-800/50"
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

      {/* MODAL: Crear/Editar Mesa */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Editar Mesa" : "Crear Nueva Mesa"}</DialogTitle>
            <DialogDescription>
              {editingTable ? "Modifica el nombre o identificador de la mesa." : "Agrega el nombre o número para identificar la mesa."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre de la Mesa</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: 12, Barra A, Terraza 5"
                defaultValue={editingTable?.name || ""}
                maxLength={50}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTableModalOpen(false)}>Cancelar</Button>
            <Button onClick={() => setIsTableModalOpen(false)}>
              {editingTable ? "Guardar Cambios" : "Guardar Mesa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL:  Eliminar Mesa (Confirmación) */}
      <Dialog open={!!tableToDelete} onOpenChange={(open) => !open && setTableToDelete(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Mesa</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar la mesa <strong>{tableToDelete?.name}</strong>? 
              <br/><br/>Esta acción no se puede deshacer y borrará los códigos QR asociados a esta mesa de forma permanente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setTableToDelete(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={() => setTableToDelete(null)}>Eliminar Mesa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Código QR */}
      <Dialog open={!!qrModalTable} onOpenChange={(open) => !open && setQrModalTable(null)}>
        <DialogContent className="sm:max-w-md print:max-w-none print:m-0 print:p-0 print:shadow-none print:border-none print:bg-white print:items-start text-center flex flex-col items-center justify-center p-8">
          <DialogHeader className="print:hidden w-full text-center">
            <DialogTitle className="text-center">Código QR - Mesa {qrModalTable?.name}</DialogTitle>
            <DialogDescription className="text-center">
              Escanea este código para acceder al menú de esta mesa.
            </DialogDescription>
          </DialogHeader>

          {/* QR Container -> Lo que se imprimirá */}
          <div 
            ref={qrRef} 
            className="flex flex-col items-center justify-center bg-white p-8 rounded-2xl shadow-sm border mt-4 mb-4 print:shadow-none print:border-none print:p-4 w-full max-w-xs"
          >
            <QRCodeCanvas
              value={`https://mipizzeria.yopido.com/qr/${qrModalTable?.qrCodeHash}`}
              size={200}
              level={"H"}
              includeMargin={false}
              className="mb-4"
              imageSettings={{
                src: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
                x: undefined,
                y: undefined,
                height: 48,
                width: 48,
                excavate: true,
              }}
            />
            <h2 className="text-2xl font-black tracking-tight text-neutral-800 mt-2 uppercase">{qrModalTable?.name}</h2>
            <p className="text-xs text-neutral-500 font-medium tracking-wide">Escanea para pedir</p>
          </div>
          
          <div className="bg-muted px-3 py-2 rounded-md font-mono text-xs mb-4 text-center break-all text-muted-foreground w-full print:hidden">
            mipizzeria.yopido.com/qr/{qrModalTable?.qrCodeHash}
          </div>

          <DialogFooter className="sm:justify-center flex-col sm:flex-row gap-2 w-full print:hidden">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handlePrintQR}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
            <Button type="button" className="w-full sm:w-auto" onClick={handleDownloadQR}>
              <Download className="mr-2 h-4 w-4" />
              Descargar (PNG)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DRAWER: Vista rápida de Sesión */}
      <Drawer open={!!sessionDrawerTable} onOpenChange={(open) => !open && setSessionDrawerTable(null)}>
        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader className="text-left">
              <DrawerTitle className="text-2xl font-bold uppercase">Mesa {sessionDrawerTable?.name}</DrawerTitle>
              <DrawerDescription>
                {sessionDrawerTable?.status === "free" ? (
                  "La mesa se encuentra libre en este momento. No hay consumo."
                ) : (
                  <>Sesión activa hace <strong className="text-foreground">{sessionDrawerTable?.sessionElapsed}</strong>.</>
                )}
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-8 flex flex-col gap-4">
              {sessionDrawerTable?.status !== "free" ? (
                <div className="flex flex-col gap-4">
                  <div className="bg-muted/50 border p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium border-b pb-2">
                      <span className="text-muted-foreground">Producto</span>
                      <span className="text-muted-foreground">Subtotal</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">2x Pizza Margarita</span>
                      <span>$24.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">3x Cerveza Artesanal</span>
                      <span>$15.00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">1x Ensalada César</span>
                      <span>$9.00</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">$48.00</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <Button variant="outline" className="w-full" onClick={() => setSessionDrawerTable(null)}>
                      Cerrar
                    </Button>
                    {sessionDrawerTable?.status === "attention" && (
                      <Button variant="default" className="w-full bg-amber-500 hover:bg-amber-600 text-white border-amber-500">
                        Marcar cuenta pagada
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-muted-foreground text-center bg-muted/40 rounded-xl border border-dashed">
                  <QrCode className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm px-4">Esta mesa está vacía. Lista para recibir a los próximos clientes.</p>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Print CSS Fix */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:max-w-none, .print\\:max-w-none * {
            visibility: visible;
          }
          .print\\:max-w-none {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 100%;
          }
        }
      ` }} />
    </div>
  );
}
