"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Siren, Loader2, Wifi, WifiOff } from "lucide-react";
import Masonry from "react-masonry-css";
import { toast } from "sonner";
import { getKdsOrdersAction, markItemServedAction, markOrderCompleteAction } from "@/app/actions/orders";
import { getSocketConfigAction } from "@/app/actions/socket-config";

// Interfaces
type OrderItem = {
  id: number;
  quantity: number;
  name: string;
  notes?: string;
  isReady: boolean;
};

type Order = {
  id: string; // "session-XX"
  sessionId: number;
  table: string;
  diner?: string;
  elapsedMinutes: number;
  createdAt: string;
  items: OrderItem[];
};

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const result = await getKdsOrdersAction();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error("Error fetching KDS orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Configuración de WebSocket NATIVO de BUN
  useEffect(() => {
    let mounted = true;
    let reconnectTimeout: any;

    async function initSocket() {
      const config = await getSocketConfigAction();
      
      if (!mounted) return;

      if (socketRef.current) {
        socketRef.current.close();
      }

      // En WebSocket nativo pasamos token y tenantId por la URL
      const wsUrl = new URL(`${config.url.replace('http', 'ws')}/ws`);
      wsUrl.searchParams.set('token', config.token || '');
      wsUrl.searchParams.set('tenantId', config.slug || '');

      const socket = new WebSocket(wsUrl.toString());
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('[WS Nativo] Conectado al servidor de cocina');
        setIsConnected(true);
      };

      socket.onclose = () => {
        console.log('[WS Nativo] Desconectado del servidor');
        setIsConnected(false);
        // Reintentar conexión tras 3 segundos
        if (mounted) {
          reconnectTimeout = setTimeout(initSocket, 3000);
        }
      };

      socket.onerror = (error) => {
        console.error('[WS Nativo] Error de conexión');
      };

      socket.onmessage = (event) => {
        try {
          const { event: eventName, data } = JSON.parse(event.data);
          
          if (eventName === 'order:created') {
            console.log('[WS Nativo] Nuevo pedido recibido:', data);
            toast("Nuevo pedido recibido", {
              description: `Mesa: ${data.table || 'Principal'}` as any,
              action: {
                label: "Ver",
                onClick: () => fetchOrders(),
              },
            });
            fetchOrders();
          }

          if (eventName === 'order-item:served') {
            setOrders((prev) =>
              prev.map((ord) => {
                if (ord.sessionId !== data.sessionId) return ord;
                return {
                  ...ord,
                  items: ord.items.map((item) =>
                    item.id === data.itemId ? { ...item, isReady: data.status === 'served' } : item
                  ),
                };
              })
            );
          }

          if (eventName === 'order:completed') {
            console.log('[WS Nativo] Orden completada:', data.sessionId);
            setOrders((prev) => prev.filter((ord) => ord.sessionId !== data.sessionId));
          }
        } catch (e) {
          console.error('[WS Nativo] Error procesando mensaje:', e);
        }
      };
    }

    initSocket();
    fetchOrders();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [fetchOrders]);

  const markItemAsServed = useCallback(async (orderId: string, itemId: number, currentStatus: boolean) => {
    if (currentStatus) return;

    // Optimistic update: marcar como listo visualmente mientras responde el backend.
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          items: ord.items.map((item) =>
            item.id === itemId ? { ...item, isReady: true } : item
          ),
        };
      })
    );

    try {
      const res = await markItemServedAction(itemId);
      if (res.success) {
        toast.success("Producto marcado como listo");
      } else {
        toast.error(res.error || "Error al actualizar producto");
      }
      // Refrescar para retirar items ya servidos de la lista pendiente.
      fetchOrders();
    } catch (error) {
      console.error("Error marking item as served:", error);
      toast.error("Error de conexión");
      fetchOrders();
    }
  }, [fetchOrders]);

  const markOrderReady = useCallback(async (sessionId: number) => {
    setOrders((prev) => {
      const order = prev.find(o => o.sessionId === sessionId);
      const allReady = order?.items.every(i => i.isReady);
      if (allReady) {
        return prev.filter((ord) => ord.sessionId !== sessionId);
      }
      return prev;
    });

    try {
      const res = await markOrderCompleteAction(sessionId);
      if (res.success) {
        toast.success("Pedido despachado correctamente");
      } else {
        toast.error(res.error || "Error al despachar pedido");
      }
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Error de conexión");
      fetchOrders();
    }
  }, [fetchOrders]);

  const getTimeColorSet = (minutes: number) => {
    if (minutes >= 20) {
      return {
        cardClass: "border-red-500/50 bg-red-50",
        headerClass: "bg-red-500 text-white",
        icon: <Siren className="w-5 h-5 animate-pulse" />,
      };
    }
    if (minutes >= 10) {
      return {
        cardClass: "border-orange-500/50 bg-orange-50",
        headerClass: "bg-orange-500 text-white",
        icon: <Clock className="w-5 h-5" />,
      };
    }
    return {
      cardClass: "border-slate-200 bg-white",
      headerClass: "bg-slate-100 text-slate-600",
      icon: <Clock className="w-5 h-5" />,
    };
  };

  const breakpointColumnsObj = {
    default: 4,
    1280: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

  const formatElapsed = (createdAt: string) => {
    const start = new Date(createdAt).getTime();
    const diff = Math.max(0, now.getTime() - start);
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    const hStr = hours > 0 ? `${hours}:` : '';
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    
    return `${hStr}${mStr}:${sStr}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-slate-300 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando cocina...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-6 px-4 pt-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Kitchen Display System</h1>
          <Badge 
            variant={isConnected ? "secondary" : "destructive"} 
            className={`font-bold transition-all duration-300 ${isConnected ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}
          >
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 mr-1.5" /> ONLINE
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 mr-1.5" /> OFFLINE
              </>
            )}
          </Badge>
        </div>
        <Badge variant="outline" className="font-bold text-slate-500">
          {orders.length} PEDIDOS ACTIVOS
        </Badge>
      </div>

      {orders.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center text-muted-foreground gap-4 mt-20">
          <CheckCircle2 className="w-24 h-24 text-slate-200" />
          <h2 className="text-2xl font-bold tracking-tight text-center text-slate-400">Cocina al día</h2>
          <p className="text-center text-slate-400">No hay pedidos pendientes por ahora.</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto gap-4"
          columnClassName="bg-clip-padding flex flex-col gap-4"
        >
          {orders.map((order) => {
            const colors = getTimeColorSet(order.elapsedMinutes);

            return (
              <Card
                key={order.id}
                className={`py-0 flex flex-col gap-0 overflow-hidden shadow-sm transition-all duration-300 w-full border-2 ${colors.cardClass}`}
              >
                <CardHeader className={`px-4 py-3 flex flex-row items-center justify-between space-y-0 gap-2 shrink-0 ${colors.headerClass}`}>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-2xl font-black uppercase tracking-tight leading-none truncate">
                      {order.table}
                    </span>
                    {order.diner && (
                      <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest truncate">
                        {order.diner}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-base font-bold bg-black/10 px-2 py-1 rounded shadow-inner shrink-0 min-w-[75px] justify-center">
                    {colors.icon}
                    {formatElapsed(order.createdAt)}
                  </div>
                </CardHeader>
  
                <CardContent className="p-0 bg-white">
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markItemAsServed(order.id, item.id, item.isReady)}
                        className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                          item.isReady ? "bg-slate-50/50" : ""
                        }`}
                      >
                        <div className="shrink-0 pointer-events-none">
                          <Checkbox
                            checked={item.isReady}
                            className={`w-6 h-6 rounded border-slate-300 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-base font-bold uppercase leading-6 transition-all ${
                              item.isReady ? "line-through text-slate-300" : "text-slate-800"
                            }`}
                          >
                            <span className="font-black text-zinc-900 mr-2">
                              {item.quantity}x
                            </span>
                            {item.name}
                          </div>
                          {item.notes && !item.isReady && (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 border-yellow-200/50 hover:bg-yellow-500/20 font-bold uppercase tracking-widest text-[10px] px-2 py-0.5 mt-1.5 w-fit">
                              ⚠️ {item.notes}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </Masonry>
      )}
    </div>
  );
}
