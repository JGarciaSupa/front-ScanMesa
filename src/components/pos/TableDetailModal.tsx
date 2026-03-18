"use client";

import {
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Users
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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

  const isOccupied = table.status === "occupied";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] h-[90vh] w-[95vw] p-0 overflow-hidden flex flex-col border-none shadow-2xl">
        <DialogHeader className={cn(
          "p-6 text-white pb-6 shrink-0 relative",
          isOccupied ? "bg-destructive" : "bg-emerald-600"
        )}>
          <div className="flex flex-col gap-1 pr-8">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-3xl font-bold tracking-tight leading-none">{table.name}</DialogTitle>
              {isOccupied && (
                <Badge variant="secondary" className="bg-white text-destructive hover:bg-white/90 font-bold uppercase tracking-wider text-[10px] px-2 py-0.5">
                  Ocupada
                </Badge>
              )}
            </div>
            <DialogDescription className="text-white/90 font-medium flex items-center gap-1.5 pt-1 text-xs">
              {isOccupied ? (
                <>
                  <Users className="w-3.5 h-3.5" />
                  Mesa en servicio
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Disponible para clientes
                </>
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 w-full bg-background">
          <div className="p-6 space-y-8">
            {isOccupied ? (
              <div className="space-y-8 pb-4">
                {/* Alertas de mozo */}
                {table.pendingCalls && table.pendingCalls.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Llamadas prioritarias</span>
                    </div>
                    <div className="space-y-2">
                      {table.pendingCalls.map(call => (
                        <Card key={call.id} className="bg-amber-50/50 border-amber-100/50 shadow-none">
                          <CardContent className="p-3 flex justify-between items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-amber-900 leading-tight">{call.reason}</span>
                              <span className="text-[10px] text-amber-600/80 font-medium">{new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-amber-200 text-amber-700 hover:bg-amber-100 font-bold text-[10px] h-7 px-3"
                              onClick={() => onResolveCall(call.id)}
                            >
                              RESOLVER
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen financiero */}
                <Card className="border-none bg-muted/40 shadow-none">
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">Total Acumulado</span>
                    <span className="text-4xl font-bold tracking-tighter tabular-nums text-foreground">{formatPrice(grandTotal)}</span>
                  </CardContent>
                </Card>

                {loadingItems ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
                    <span className="text-xs text-muted-foreground font-medium">Cargando pedidos...</span>
                  </div>
                ) : Object.keys(dinersMap).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(dinersMap).map(([id, diner], index, arr) => (
                      <div key={id} className="space-y-4">
                        <div className="flex justify-between items-end border-b pb-2">
                          <h4 className="text-xs font-bold flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5" />
                            {diner.name}
                          </h4>
                          <span className="text-sm font-bold text-foreground">
                            {formatPrice(diner.items.reduce((s, i) => s + (i.price * i.quantity), 0))}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {diner.items.map(item => {
                            const isServed = item.kitchenStatus === "served";
                            return (
                              <div 
                                key={item.id} 
                                className={cn(
                                  "flex items-center gap-4 px-3 py-2 -mx-3 rounded-xl transition-all",
                                  !isServed && "cursor-pointer hover:bg-muted/50 active:scale-[0.99]"
                                )}
                                onClick={() => !isServed && onMarkAsServed(item.id, item.kitchenStatus)}
                              >
                                <Checkbox 
                                  id={`item-${item.id}`}
                                  checked={isServed}
                                  className="w-5 h-5 rounded-md border-muted-foreground/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 shrink-0 pointer-events-none"
                                />
                                <div className="flex flex-col flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "font-semibold text-sm leading-tight text-foreground line-clamp-2",
                                      isServed && "text-muted-foreground line-through decoration-1"
                                    )}>
                                      {item.quantity}x {item.name}
                                    </span>
                                  </div>
                                  <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-tight pt-0.5",
                                    isServed ? "text-emerald-600" : "text-amber-600"
                                  )}>
                                    {isServed ? "Entregado" : "Pendiente"}
                                  </span>
                                </div>
                                <span className="font-bold text-sm tabular-nums text-foreground shrink-0">
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {index < arr.length - 1 && <Separator className="mt-6 opacity-30" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-30">
                    <Loader2 className="w-8 h-8" />
                    <p className="text-sm font-medium italic">Esperando primeros pedidos...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">Mesa Disponible</h3>
                  <p className="text-muted-foreground text-xs max-w-[220px]">Actualmente no hay una sesión activa en esta mesa.</p>
                </div>
                <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-sm" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {isOccupied && (
          <div className="p-4 bg-background border-t shrink-0">
            <Button 
              className="w-full h-12 text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-[0.98]"
              size="lg"
              onClick={onOpenCloseConfirm}
              disabled={!table.activeSession}
            >
              {grandTotal > 0 ? "Cobrar y Cerrar Mesa" : "Liberar Mesa"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
