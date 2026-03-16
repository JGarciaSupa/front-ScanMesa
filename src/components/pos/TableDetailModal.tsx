"use client";

import { 
  Clock, 
  LogOut, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatPrice } from "@/lib/utils";
import { Table, OrderItem } from "@/app/pos/types";

interface TableDetailModalProps {
  /** La mesa seleccionada para mostrar detalles */
  table: Table | null;
  /** Estado de visibilidad del modal */
  isOpen: boolean;
  /** Función para cerrar el modal */
  onClose: () => void;
  /** Indica si se están cargando los items de la sesión de la mesa */
  loadingItems: boolean;
  /** Lista de productos consumidos en la mesa */
  tableItems: OrderItem[];
  /** Suma total del consumo actual */
  grandTotal: number;
  /** Función para marcar una llamada de mozo como resuelta */
  onResolveCall: (callId: number) => void;
  /** Función para marcar un item como entregado/servido */
  onMarkAsServed: (itemId: number, status: string) => void;
  /** Función para abrir el diálogo de cobro y liberación */
  onOpenCloseConfirm: () => void;
}

/**
 * Modal detallado que muestra toda la actividad de una mesa seleccionada.
 * - Si la mesa está OCUPADA: Muestra llamadas de mozo, lista de items por comensal y botón de cobro.
 * - Si la mesa está LIBRE: Muestra un mensaje de disponibilidad.
 */
export function TableDetailModal({
  table,
  isOpen,
  onClose,
  loadingItems,
  tableItems,
  grandTotal,
  onResolveCall,
  onMarkAsServed,
  onOpenCloseConfirm
}: TableDetailModalProps) {
  if (!table) return null;

  // Agrupación de items por comensal para facilitar la lectura
  const dinersMap: Record<number, { name: string, items: OrderItem[] }> = {};
  tableItems.forEach(item => {
    if (!dinersMap[item.guestId]) dinersMap[item.guestId] = { name: item.guestName, items: [] };
    dinersMap[item.guestId].items.push(item);
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl max-h-[96vh] flex flex-col">
        <DialogHeader className={cn(
          "p-8 text-white pb-6 shrink-0",
          table.status === "occupied" ? "bg-red-600" : "bg-emerald-600"
        )}>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Mesa {table.name}</DialogTitle>
          <DialogDescription className="text-white/80 font-bold uppercase text-xs tracking-widest">
            {table.status === "occupied" ? "Consumo en curso" : "Mesa disponível"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-8 space-y-8">
            {table.status === "occupied" ? (
              <div className="space-y-6">
                {/* Alertas de Mozo: Sección crítica para atención al cliente */}
                {table.pendingCalls && table.pendingCalls.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                       <AlertCircle className="w-3.5 h-3.5" /> Llamadas pendientes
                    </h4>
                    <div className="space-y-2">
                      {table.pendingCalls.map(call => (
                        <div key={call.id} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex justify-between items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-amber-900 leading-tight">{call.reason}</span>
                            <span className="text-[10px] text-amber-600 font-medium">{new Date(call.createdAt).toLocaleTimeString()}</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-amber-600 hover:bg-amber-700 h-8 rounded-xl font-bold text-[10px] px-3 transition-all active:scale-95"
                            onClick={() => onResolveCall(call.id)}
                          >
                            RESOLVER
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen financiero rápido */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <span className="text-muted-foreground font-black text-[10px] uppercase tracking-widest block mb-1">Total acumulado:</span>
                  <span className="text-4xl font-black tracking-tighter text-slate-900 block">{formatPrice(grandTotal)}</span>
                </div>

                {loadingItems ? (
                  <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                ) : Object.keys(dinersMap).length > 0 ? (
                  <div className="space-y-6">
                    {/* Lista detallada de productos agrupados por comensal */}
                    {Object.entries(dinersMap).map(([id, diner]) => (
                      <div key={id} className="space-y-3">
                        <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex justify-between">
                          {diner.name}
                          <span className="text-slate-900">{formatPrice(diner.items.reduce((s, i) => s + (i.price * i.quantity), 0))}</span>
                        </h4>
                        <ul className="space-y-3">
                          {diner.items.map(item => (
                            <li key={item.id} className="flex justify-between items-center group">
                              <div className="flex flex-col flex-1">
                                <span className="font-bold text-slate-900 text-sm">{item.quantity}x {item.name}</span>
                                {item.kitchenStatus !== "served" ? (
                                  <button 
                                    onClick={() => onMarkAsServed(item.id, item.kitchenStatus)}
                                    className="text-[9px] bg-amber-100 text-amber-700 hover:bg-amber-200 px-2 py-0.5 rounded-full font-black tracking-tighter flex items-center gap-1 mt-1 transition-colors"
                                  >
                                    <Clock className="w-2.5 h-2.5" /> MARCAR ENTREGADO
                                  </button>
                                ) : (
                                  <span className="text-[9px] text-emerald-500 font-bold tracking-tighter flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-2.5 h-2.5" /> ENTREGADO
                                  </span>
                                )}
                              </div>
                              <span className="font-black text-slate-900 text-sm">{formatPrice(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-10 text-slate-300 font-bold italic">Esperando pedidos...</p>
                )}

                <Button 
                  className="w-full h-14 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
                  onClick={onOpenCloseConfirm}
                  disabled={!table.activeSession || grandTotal === 0}
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cobrar y Liberar Mesa
                </Button>
              </div>
            ) : (
              <div className="text-center py-10 space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <p className="text-slate-500 font-medium">La mesa está lista para nuevos clientes.</p>
                <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" onClick={onClose}>Volver</Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
