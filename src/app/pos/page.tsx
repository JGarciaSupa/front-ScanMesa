"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  Users, 
  Clock, 
  BellRing, 
  LogOut, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getTablesAction } from "@/app/actions/tables";
import { closeSessionAction, getSessionItemsAction } from "@/app/actions/orders";

// --- Types ---
interface Table {
  id: number;
  name: string;
  status: "free" | "occupied";
  qrCodeHash: string;
  activeSession?: {
    id: number;
    code: string;
    status: string;
    openedAt: string;
  } | null;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  guestId: number;
  guestName: string;
}

export default function PosPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableItems, setTableItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTablesAction();
      if (res.success) {
        setTables(res.data);
      } else {
        toast.error(res.error || "Error al cargar mesas");
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 60000);
    return () => clearInterval(interval);
  }, [fetchTables]);

  const fetchSessionItems = async (sessionId: number) => {
    try {
      setLoadingItems(true);
      const result = await getSessionItemsAction(sessionId);
      if (result.success) {
        setTableItems(result.data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleOpenTable = (table: Table) => {
    setSelectedTable(table);
    if (table.activeSession) {
      fetchSessionItems(table.activeSession.id);
    } else {
      setTableItems([]);
    }
  };

  const handleLiberateTable = async (sessionId: number) => {
    try {
      const res = await closeSessionAction(sessionId);
      if (res.success) {
        toast.success("Mesa liberada correctamente");
        setSelectedTable(null);
        fetchTables();
      } else {
        toast.error(res.error || "Error al liberar mesa");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  // Group items by guest
  const dinersMap: Record<number, { name: string, items: OrderItem[] }> = {};
  tableItems.forEach(item => {
    if (!dinersMap[item.guestId]) {
      dinersMap[item.guestId] = {
        name: item.guestName,
        items: []
      };
    }
    dinersMap[item.guestId].items.push(item);
  });
  
  const totalAmount = tableItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POS - Mapa de Mesas</h1>
          <p className="text-muted-foreground">Monitoreo y gestión de sesiones activas.</p>
        </div>
        <Button onClick={fetchTables} variant="outline" disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
          Actualizar
        </Button>
      </div>

      {loading && tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p>Cargando mesas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {tables.map((table) => (
            <Card 
              key={table.id}
              className={cn(
                "cursor-pointer transition-all hover:scale-105 border-2",
                table.status === "occupied" ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
              )}
              onClick={() => handleOpenTable(table)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2">
                <span className="text-3xl font-black text-slate-800 leading-none">{table.name}</span>
                <Badge variant={table.status === "occupied" ? "destructive" : "secondary"} className="text-[10px] uppercase tracking-wider">
                  {table.status === "occupied" ? "Ocupada" : "Libre"}
                </Badge>
                {table.activeSession && (
                  <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold mt-1 bg-red-100 px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" />
                    ACTIVA
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
          <DialogHeader className={cn(
            "p-6 text-white pb-4",
            selectedTable?.status === "occupied" ? "bg-red-600" : "bg-emerald-600"
          )}>
            <DialogTitle className="text-2xl font-black uppercase">Mesa {selectedTable?.name}</DialogTitle>
            <DialogDescription className="text-white/80">
              {selectedTable?.status === "occupied" ? "En consumo" : "Disponible"}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {selectedTable?.status === "occupied" ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end border-b pb-4">
                  <span className="text-muted-foreground font-medium">Consumo Total:</span>
                  <span className="text-3xl font-black tracking-tighter">€{totalAmount.toFixed(2)}</span>
                </div>

                <ScrollArea className="h-[250px] pr-4">
                  {loadingItems ? (
                    <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin" /></div>
                  ) : Object.keys(dinersMap).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(dinersMap).map(([id, diner]) => (
                        <div key={id} className="space-y-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase flex justify-between">
                            {diner.name}
                            <span>€{diner.items.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}</span>
                          </h4>
                          <ul className="space-y-1">
                            {diner.items.map(item => (
                              <li key={item.id} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-medium">€{(item.price * item.quantity).toFixed(2)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-10 text-muted-foreground italic">Sin consumos registrados todavía.</p>
                  )}
                </ScrollArea>

                <div className="pt-4 flex flex-col gap-3">
                  <Button variant="outline" className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Añadir Pedido (En Desarrollo)
                  </Button>
                  <Button 
                    className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={() => handleLiberateTable(selectedTable.activeSession!.id)}
                    disabled={!selectedTable.activeSession}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cobrar y Liberar Mesa
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                <p className="text-muted-foreground">La mesa {selectedTable?.name} está actualmente disponible para nuevos clientes.</p>
                <Button className="w-full h-11 bg-emerald-600" onClick={() => setSelectedTable(null)}>Cerrar</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
