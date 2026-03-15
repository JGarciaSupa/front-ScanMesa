"use client";

import { useState, useCallback, useEffect } from "react";
import { 
  Clock, 
  LogOut, 
  CheckCircle2, 
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
  Bell,
  BellOff,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getPosTablesAction } from "@/app/actions/pos";
import { closeSessionAction, getSessionItemsAction, markItemServedAction, markOrderCompleteAction, resolveWaiterCallAction } from "@/app/actions/orders";
import { getSocketConfigAction } from "@/app/actions/socket-config";
import { useRef } from "react";
import { usePosStore } from "@/store/usePosStore";

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
  pendingCalls?: {
    id: number;
    reason: string;
    status: string;
    createdAt: string;
  }[];
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  guestId: number;
  guestName: string;
  kitchenStatus: "pending" | "served";
  invoiceId?: number | null;
}

export default function PosPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableItems, setTableItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const socketRef = useRef<WebSocket | null>(null);
  const selectedSessionIdRef = useRef<number | null>(null);
  const addAlert = usePosStore((state) => state.addAlert);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const currentPermission = Notification.permission;
      setPermissionState(currentPermission);
      
      const storedPref = localStorage.getItem("pos-notifications-enabled");
      
      // If permission is already granted, we enable them based on stored preference (default true if granted)
      if (currentPermission === "granted") {
        setNotificationsEnabled(storedPref !== "false");
      } 
      // If permission is default (not asked yet), show prompt if they haven't explicitly said "no"
      else if (currentPermission === "default" && storedPref !== "false") {
        // SMALL DELAY to ensure UI is ready
        const timer = setTimeout(() => setShowNotificationPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
    selectedSessionIdRef.current = selectedTable?.activeSession?.id || null;
  }, [selectedTable?.activeSession?.id]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Tu navegador no soporta notificaciones");
      return;
    }

    if (Notification.permission === "denied") {
      toast.error("Las notificaciones están bloqueadas. Habilítalas en la configuración del sitio.", { duration: 8000 });
      setPermissionState("denied");
      setNotificationsEnabled(false);
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionState(permission);
    
    if (permission === "granted") {
      setNotificationsEnabled(true);
      localStorage.setItem("pos-notifications-enabled", "true");
      toast.success("¡Notificaciones activadas!");
      new Notification("Notificaciones activadas", {
        body: "Recibirás alertas cuando los pedidos estén listos o llamen al mozo.",
      });
    } else {
      setNotificationsEnabled(false);
      if (permission === "denied") {
        localStorage.setItem("pos-notifications-enabled", "false");
      }
    }
    setShowNotificationPrompt(false);
  };

  const sendPushNotification = (title: string, body: string) => {
    if (notificationsEnabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        console.log(`Sending notification: ${title} - ${body}`);
        const notification = new Notification(title, { 
          body,
          icon: '/icon-192x192.png', // Added icon from public folder
          silent: false,
          requireInteraction: false
        });
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (e) { 
        console.error("Error sending notification:", e); 
      }
    } else {
      console.warn("Notifications not enabled or permission not granted", { notificationsEnabled, permission: Notification.permission });
    }
  };

  const handleToggleNotifications = async (checked: boolean) => {
    localStorage.setItem("pos-notifications-enabled", checked.toString());
    if (checked) {
      await requestNotificationPermission();
    } else {
      setNotificationsEnabled(false);
      toast.info("Notificaciones desactivadas");
    }
  };

  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPosTablesAction();
      if (res.success) {
        setTables(res.data);
      } else {
        toast.error(res.error || "Error al cargar mesas");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let reconnectTimeout: any;

    async function initSocket() {
      const config = await getSocketConfigAction();
      if (!mounted) return;
      if (socketRef.current) socketRef.current.close();

      const wsUrl = new URL(`${config.url.replace('http', 'ws')}/ws`);
      wsUrl.searchParams.set('token', config.token || '');
      wsUrl.searchParams.set('tenantId', config.slug || '');

      const socket = new WebSocket(wsUrl.toString());
      socketRef.current = socket;

      socket.onopen = () => setIsConnected(true);
      socket.onclose = () => {
        setIsConnected(false);
        if (mounted) reconnectTimeout = setTimeout(initSocket, 3000);
      };

      socket.onmessage = (event) => {
        try {
          const { event: eventName, data } = JSON.parse(event.data);
          if (
            eventName === 'table:opened' || 
            eventName === 'session:closed' || 
            eventName === 'order:created' || 
            eventName === 'waiter:called' || 
            eventName === 'waiter:resolved'
          ) {
            fetchTables();
            const sessionId = data.sessionId || (Array.isArray(data) ? data[0]?.sessionId : null);
            if (eventName === 'order:created') {
              sendPushNotification("¡Nuevo Pedido!", "Hay una nueva orden en camino.");
              addAlert({ title: "¡Nuevo Pedido!", description: "Hay una nueva orden en camino.", type: "info" });
            }
            if (eventName === 'order:created' && sessionId && selectedSessionIdRef.current === sessionId) {
              fetchSessionItems(sessionId);
            }
          }

          if (eventName === 'order-item:served') {
            setTableItems((prev) => prev.map((item) => item.id === data.itemId ? { ...item, kitchenStatus: data.status } : item));
            toast.info(`¡Plato listo para servir!`);
            sendPushNotification("¡Plato listo!", "Un pedido está listo para ser servido.");
            addAlert({ title: "¡Plato listo!", description: "Un pedido está listo para ser servido.", type: "success" });
          }

          if (eventName === 'waiter:called') {
            toast.warning(`¡Llamada de mozo!`, { description: `Mesa ${data.tableId}: ${data.reason}`, duration: 10000 });
            sendPushNotification("¡Llamada de Mozo!", `Mesa ${data.tableId}: ${data.reason}`);
            addAlert({ title: "¡Llamada de Mozo!", description: `Mesa ${data.tableId}: ${data.reason}`, type: "warning" });
          }

          if (eventName === 'checkout:requested') {
            toast.success(`¡Solicitud de cuenta!`, { description: `Mesa ${data.tableId} solicita pagar.`, duration: 10000 });
            sendPushNotification("¡Solicitud de Cuenta!", `Mesa ${data.tableId} solicita su cuenta.`);
            addAlert({ title: "¡Solicitud de Cuenta!", description: `Mesa ${data.tableId} solicita su cuenta.`, type: "success" });
            fetchTables();
          }
        } catch (e) {
          console.error(e);
        }
      };
    }

    initSocket();
    fetchTables();
    return () => { mounted = false; clearTimeout(reconnectTimeout); if (socketRef.current) socketRef.current.close(); };
  }, [fetchTables]);

  const fetchSessionItems = async (sessionId: number) => {
    try {
      setLoadingItems(true);
      const result = await getSessionItemsAction(sessionId);
      if (result.success) {
        setTableItems(result.data);
      }
    } catch (error) { console.error(error); } finally { setLoadingItems(false); }
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
      setIsClosing(true);
      const res = await closeSessionAction(sessionId, {});
      if (res.success) {
        toast.success("Venta registrada y mesa liberada");
        setIsConfirmingClose(false);
        setSelectedTable(null);
        fetchTables();
      } else {
        toast.error(res.error || "Error al liberar mesa");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de conexión");
    } finally {
      setIsClosing(false);
    }
  };

  const handleMarkAsServed = async (itemId: number, currentStatus: string) => {
    if (currentStatus === "served") return;
    setTableItems(prev => prev.map(item => item.id === itemId ? { ...item, kitchenStatus: "served" } : item));
    try {
      const res = await markItemServedAction(itemId);
      if (res.success) {
        toast.success("Servido");
        const updatedItems = tableItems.map(item => item.id === itemId ? { ...item, kitchenStatus: "served" } : item);
        const allServed = updatedItems.every(item => item.kitchenStatus === "served");
        if (allServed && selectedTable?.activeSession) {
          await markOrderCompleteAction(selectedTable.activeSession.id);
        }
      } else {
        toast.error(res.error || "Error al actualizar");
        if (selectedTable?.activeSession) fetchSessionItems(selectedTable.activeSession.id);
      }
    } catch (error) { toast.error("Error de conexión"); }
  };

  const handleResolveWaiterCall = async (callId: number) => {
    try {
      const res = await resolveWaiterCallAction(callId);
      if (res.success) {
        toast.success("Llamada resuelta");
        fetchTables();
        if (selectedTable) {
          setSelectedTable({
            ...selectedTable,
            pendingCalls: selectedTable.pendingCalls?.filter(c => c.id !== callId)
          });
        }
      } else {
        toast.error(res.error || "Error al resolver llamada");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  // Group items by guest for display
  const dinersMap: Record<number, { name: string, items: OrderItem[] }> = {};
  tableItems.forEach(item => {
    if (!dinersMap[item.guestId]) dinersMap[item.guestId] = { name: item.guestName, items: [] };
    dinersMap[item.guestId].items.push(item);
  });

  const grandTotal = tableItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">POS - Gestión de Salón</h1>
            <p className="text-muted-foreground text-sm font-medium">Control en tiempo real de las mesas del restaurante.</p>
          </div>
          <Badge variant={isConnected ? "secondary" : "destructive"} className={cn("font-bold", isConnected ? "bg-green-100 text-green-700" : "")}>
            {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isConnected ? "ONLINE" : "OFFLINE"}
          </Badge>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
            <Label htmlFor="notifications" className="cursor-pointer group">
              {notificationsEnabled ? (
                <Bell className="w-4 h-4 text-primary animate-ring" />
              ) : (
                <BellOff className="w-4 h-4 text-slate-400" />
              )}
            </Label>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Notificaciones</span>
              <Switch 
                id="notifications" 
                checked={notificationsEnabled} 
                onCheckedChange={handleToggleNotifications}
              />
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative h-12 w-12 rounded-2xl border-2 hover:bg-slate-50 transition-all">
                <Bell className="h-5 w-5" />
                {usePosStore((state) => state.getUnreadCount()) > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                    {usePosStore((state) => state.getUnreadCount())}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-[24px] border-none shadow-2xl overflow-hidden" align="end">
              <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Alertas Recientes</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-[10px] font-bold hover:bg-white/10 text-white/60 hover:text-white"
                  onClick={() => usePosStore.getState().clearAlerts()}
                >
                  Limpiar
                </Button>
              </div>
              <ScrollArea className="h-[350px]">
                <div className="p-2">
                  {usePosStore((state) => state.alerts).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                        <MessageSquare className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400">Sin alertas pendientes</p>
                    </div>
                  ) : (
                    usePosStore((state) => state.alerts).map((alert) => (
                      <div 
                        key={alert.id} 
                        className={cn(
                          "p-4 rounded-2xl mb-1 transition-all border border-transparent hover:border-slate-100",
                          !alert.isRead ? "bg-slate-50" : "opacity-60"
                        )}
                        onClick={() => usePosStore.getState().markAsRead(alert.id)}
                      >
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                            alert.type === 'success' ? "bg-emerald-100 text-emerald-700" : 
                            alert.type === 'warning' ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {alert.title}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-600 leading-relaxed">{alert.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading && tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="font-bold text-slate-400">Preparando mapa de mesas...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2",
                table.status === "occupied" ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
              )}
              onClick={() => handleOpenTable(table)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2 relative">
                {table.status === "occupied" && table.pendingCalls && table.pendingCalls.length > 0 && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                )}
                <span className="text-3xl font-black text-slate-800 leading-none">{table.name}</span>
                <Badge variant={table.status === "occupied" ? "destructive" : "secondary"} className="text-[10px] uppercase font-black tracking-widest">
                  {table.status === "occupied" ? "Ocupada" : "Libre"}
                </Badge>
                {table.status === "occupied" && (
                  <div className="flex flex-col gap-1 items-center">
                    <div className="flex items-center gap-1 text-[10px] text-red-600 font-black mt-1 bg-red-100 px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> EN MARCHA
                    </div>
                    {table.pendingCalls && table.pendingCalls.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-600 font-black bg-amber-100 px-3 py-1 rounded-full">
                        <AlertCircle className="w-3 h-3" /> {table.pendingCalls.length} LLAMADA{table.pendingCalls.length > 1 ? 'S' : ''}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-[32px] border-none shadow-2xl max-h-[96vh] flex flex-col">
          <DialogHeader className={cn(
            "p-8 text-white pb-6 flex-shrink-0",
            selectedTable?.status === "occupied" ? "bg-red-600" : "bg-emerald-600"
          )}>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Mesa {selectedTable?.name}</DialogTitle>
            <DialogDescription className="text-white/80 font-bold uppercase text-xs tracking-widest">
              {selectedTable?.status === "occupied" ? "Consumo en curso" : "Mesa disponível"}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-8 space-y-8">
              {selectedTable?.status === "occupied" ? (
                <div className="space-y-6">
                  {/* Alertas de Mozo */}
                  {selectedTable.pendingCalls && selectedTable.pendingCalls.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                         <AlertCircle className="w-3.5 h-3.5" /> Llamadas pendientes
                      </h4>
                      <div className="space-y-2">
                        {selectedTable.pendingCalls.map(call => (
                          <div key={call.id} className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex justify-between items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-amber-900 leading-tight">{call.reason}</span>
                              <span className="text-[10px] text-amber-600 font-medium">{new Date(call.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <Button 
                              size="sm" 
                              className="bg-amber-600 hover:bg-amber-700 h-8 rounded-xl font-bold text-[10px] px-3 transition-all active:scale-95"
                              onClick={() => handleResolveWaiterCall(call.id)}
                            >
                              RESOLVER
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <span className="text-muted-foreground font-black text-[10px] uppercase tracking-widest block mb-1">Total acumulado:</span>
                    <span className="text-4xl font-black tracking-tighter text-slate-900 block">€{grandTotal.toFixed(2)}</span>
                  </div>

                  {loadingItems ? (
                    <div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-slate-300" /></div>
                  ) : Object.keys(dinersMap).length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(dinersMap).map(([id, diner]) => (
                        <div key={id} className="space-y-3">
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex justify-between">
                            {diner.name}
                            <span className="text-slate-900">€{diner.items.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}</span>
                          </h4>
                          <ul className="space-y-3">
                            {diner.items.map(item => (
                              <li key={item.id} className="flex justify-between items-center group">
                                <div className="flex flex-col flex-1">
                                  <span className="font-bold text-slate-900 text-sm">{item.quantity}x {item.name}</span>
                                  {item.kitchenStatus !== "served" ? (
                                    <button 
                                      onClick={() => handleMarkAsServed(item.id, item.kitchenStatus)}
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
                                <span className="font-black text-slate-900 text-sm">€{(item.price * item.quantity).toFixed(2)}</span>
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
                    onClick={() => setIsConfirmingClose(true)}
                    disabled={!selectedTable.activeSession || grandTotal === 0}
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
                  <Button variant="outline" className="w-full h-12 rounded-2xl font-bold" onClick={() => setSelectedTable(null)}>Volver</Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Closing Session */}
      <Dialog open={isConfirmingClose} onOpenChange={setIsConfirmingClose}>
        <DialogContent className="sm:max-w-[400px] p-8 rounded-[32px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-black tracking-tight">Finalizar servicio</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              Confirma el pago para liberar la mesa y generar el comprobante.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">

            <div className="bg-slate-900 p-6 rounded-[24px] text-white flex justify-between items-center shadow-lg shadow-slate-200">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total a cobrar</span>
              <span className="text-3xl font-black tracking-tighter">€{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white font-black h-14 rounded-2xl uppercase tracking-widest shadow-xl shadow-red-100 transition-all active:scale-95"
              onClick={() => selectedTable?.activeSession && handleLiberateTable(selectedTable.activeSession.id)}
              disabled={isClosing}
            >
              {isClosing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
              Confirmar y Cerrar Mesa
            </Button>
            <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-400" onClick={() => setIsConfirmingClose(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Notification and PWA Prompt */}
      <Dialog open={showNotificationPrompt} onOpenChange={setShowNotificationPrompt}>
        <DialogContent className="sm:max-w-[400px] p-8 rounded-[32px] border-none shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Bell className="w-10 h-10 text-primary" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight">Activar Notificaciones</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium px-4">
                Recibe alertas en tiempo real cuando un plato esté listo, un cliente llame al mozo o soliciten la cuenta.
              </DialogDescription>
            </div>
            <div className="flex flex-col w-full gap-3 pt-4">
              <Button 
                className="h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
                onClick={requestNotificationPermission}
              >
                Permitir Notificaciones
              </Button>
              <Button 
                variant="ghost" 
                className="h-12 rounded-2xl font-bold text-slate-400"
                onClick={() => {
                  setShowNotificationPrompt(false);
                  localStorage.setItem("pos-notifications-enabled", "false");
                  toast.info("Puedes activarlas luego desde el menú superior.");
                }}
              >
                Quizás más tarde
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
