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
  MoreVertical,
  Wifi,
  WifiOff,
  Bell
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { getPosTablesAction, openPosSessionAction } from "@/app/actions/pos";
import { closeSessionAction, getSessionItemsAction, markItemServedAction, markOrderCompleteAction } from "@/app/actions/orders";
import { getSocketConfigAction } from "@/app/actions/socket-config";
import { useRef } from "react";

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
  kitchenStatus: "pending" | "served";
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

  useEffect(() => {
    // Check for notification permission on mount
    if (typeof window !== "undefined" && "Notification" in window) {
      const currentPermission = Notification.permission;
      setPermissionState(currentPermission);
      
      const storedPref = localStorage.getItem("pos-notifications-enabled");
      
      // Only show prompt if permission is default and we haven't been told to stay quiet
      if (currentPermission === "default" && storedPref !== "false") {
        setShowNotificationPrompt(true);
      } else if (currentPermission === "granted") {
        setNotificationsEnabled(storedPref !== "false");
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
      toast.error("Las notificaciones están bloqueadas en tu navegador. Debes habilitarlas en la configuración del sitio (icono del candado).", {
        duration: 8000
      });
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
        toast.error("Permiso denegado. Para activarlas, haz clic en el icono del candado en la barra de direcciones.");
      }
    }
    setShowNotificationPrompt(false);
  };

  const sendPushNotification = (title: string, body: string) => {
    if (notificationsEnabled && Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch (e) {
        console.error("Error sending notification:", e);
      }
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
      console.error("Error fetching tables:", error);
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

      if (socketRef.current) {
        socketRef.current.close();
      }

      const wsUrl = new URL(`${config.url.replace('http', 'ws')}/ws`);
      wsUrl.searchParams.set('token', config.token || '');
      wsUrl.searchParams.set('tenantId', config.slug || '');

      const socket = new WebSocket(wsUrl.toString());
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('[WS POS] Conectado');
        setIsConnected(true);
      };

      socket.onclose = () => {
        console.log('[WS POS] Desconectado');
        setIsConnected(false);
        if (mounted) {
          reconnectTimeout = setTimeout(initSocket, 3000);
        }
      };

      socket.onmessage = (event) => {
        try {
          const { event: eventName, data } = JSON.parse(event.data);
          console.log(`[WS POS] Evento: ${eventName}`, data);

          if (eventName === 'table:opened' || eventName === 'session:closed' || eventName === 'order:created') {
            fetchTables();
            
            // Determinar sessionId (data puede ser un item o un array de items)
            const sessionId = data.sessionId || (Array.isArray(data) ? data[0]?.sessionId : null);

            if (eventName === 'order:created') {
              sendPushNotification("¡Nuevo Pedido!", `Hay una nueva orden en camino.`);
            }

            // Si tenemos la mesa abierta en el modal y hay un nuevo pedido, refrescar items
            if (eventName === 'order:created' && sessionId && selectedSessionIdRef.current === sessionId) {
              fetchSessionItems(sessionId);
            }
          }

          if (eventName === 'order-item:served') {
            // Actualizar estado del item en la vista si coincide con la sesión actual
            setTableItems((prev) =>
              prev.map((item) =>
                item.id === data.itemId ? { ...item, kitchenStatus: data.status } : item
              )
            );
            
            // Si es la mesa que estamos viendo, notificar
            const description = `Un item ha sido marcado como servido en cocina.`;
            toast.info(`¡Plato listo para servir!`, {
              description
            });
            sendPushNotification("¡Plato listo!", description);
          }

          if (eventName === 'waiter:called') {
            const description = `Mesa ${data.tableId}: ${data.reason}`;
            toast.warning(`¡Llamada de mozo!`, {
              description,
              duration: 10000,
            });
            sendPushNotification("¡Llamada de Mozo!", description);
          }

          if (eventName === 'checkout:requested') {
            const description = `Mesa ${data.tableId} solicita pagar con ${data.paymentMethod}.`;
            toast.success(`¡Solicitud de cuenta!`, {
              description,
              duration: 10000,
            });
            sendPushNotification("¡Solicitud de Cuenta!", description);
            fetchTables();
          }
        } catch (e) {
          console.error('[WS POS] Error procesando mensaje:', e);
        }
      };
    }

    initSocket();
    fetchTables();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimeout);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
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

  const handleOpenNewSession = async (tableId: number) => {
    try {
      setLoading(true);
      const res = await openPosSessionAction(tableId);
      if (res.success) {
        toast.success("Mesa abierta correctamente");
        fetchTables();
        setSelectedTable(null);
      } else {
        toast.error(res.error || "Error al abrir mesa");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleLiberateTable = async (sessionId: number) => {
    try {
      setIsClosing(true);
      const res = await closeSessionAction(sessionId);
      if (res.success) {
        toast.success("Mesa liberada correctamente");
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

    // Optimistic update
    setTableItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, kitchenStatus: "served" } : item
    ));

    try {
      const res = await markItemServedAction(itemId);
      if (res.success) {
        toast.success("Producto marcado como listo");
        
        // Verificar si después de este cambio, todos los items de la sesión están listos
        // Usamos el estado actualizado (tableItems)
        const updatedItems = tableItems.map(item => 
          item.id === itemId ? { ...item, kitchenStatus: "served" } : item
        );
        
        const allServed = updatedItems.every(item => item.kitchenStatus === "served");
        
        if (allServed && selectedTable?.activeSession) {
          // Si todos están listos, notificamos al KDS que esta orden ya se puede quitar
          // Esto dispara el evento order:completed en el backend
          await markOrderCompleteAction(selectedTable.activeSession.id);
          console.log("[POS] Orden marcada como completa automáticamente");
        }
      } else {
        toast.error(res.error || "Error al actualizar");
        // Rollback if failed
        if (selectedTable?.activeSession) {
          fetchSessionItems(selectedTable.activeSession.id);
        }
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
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">POS - Mapa de Mesas</h1>
            <p className="text-muted-foreground">Monitoreo y gestión de sesiones activas.</p>
          </div>
          <Badge 
            variant={isConnected ? "secondary" : "destructive"} 
            className={`font-bold transition-all duration-300 ${isConnected ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}`}
          >
            {isConnected ? (
              <><Wifi className="w-3 h-3 mr-1.5" /> ONLINE</>
            ) : (
              <><WifiOff className="w-3 h-3 mr-1.5" /> OFFLINE</>
            )}
          </Badge>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            <div className="flex items-center gap-2">
              <Bell className={cn("w-4 h-4", notificationsEnabled ? "text-primary fill-primary/10" : "text-muted-foreground")} />
              <Label htmlFor="notifications" className="text-sm font-medium cursor-pointer">
                Notificaciones
              </Label>
            </div>
            <Switch 
              id="notifications" 
              checked={notificationsEnabled} 
              onCheckedChange={handleToggleNotifications}
            />
          </div>
          <Button onClick={fetchTables} variant="outline" disabled={loading}>
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Notification Toggle for mobile (floating or integrated if needed) - for now just keep it in header */}
      <div className="md:hidden flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 mb-6">
        <div className="flex items-center gap-2">
          <Bell className={cn("w-4 h-4", notificationsEnabled ? "text-primary" : "text-muted-foreground")} />
          <span className="text-sm font-medium">Notificaciones Push</span>
        </div>
        <Switch 
          checked={notificationsEnabled} 
          onCheckedChange={handleToggleNotifications}
        />
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
                              <li 
                                key={item.id} 
                                className={cn(
                                  "flex justify-between items-center text-sm p-1 rounded transition-colors group",
                                  item.kitchenStatus === "served" ? "bg-slate-50 opacity-60" : "hover:bg-slate-50 cursor-pointer"
                                )}
                                onClick={() => handleMarkAsServed(item.id, item.kitchenStatus)}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                    item.kitchenStatus === "served" 
                                      ? "bg-slate-900 border-slate-900" 
                                      : "border-slate-300 group-hover:border-slate-400"
                                  )}>
                                    {item.kitchenStatus === "served" && <CheckCircle2 className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className={cn(item.kitchenStatus === "served" && "line-through")}>
                                    {item.quantity}x {item.name}
                                  </span>
                                </div>
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
                  <Button 
                    className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold"
                    onClick={() => setIsConfirmingClose(true)}
                    disabled={!selectedTable.activeSession}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cobrar y Liberar Mesa
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto" />
                <p className="text-muted-foreground font-medium">La mesa {selectedTable?.name} está actualmente disponible.</p>
                <Button variant="outline" className="w-full h-11" onClick={() => setSelectedTable(null)}>Cerrar</Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal for Closing Session */}
      <Dialog open={isConfirmingClose} onOpenChange={setIsConfirmingClose}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>¿Confirmar cierre de mesa?</DialogTitle>
            <DialogDescription>
              Esta acción marcará la mesa {selectedTable?.name} como libre y cerrará la sesión de consumo. Asegúrate de haber procesado el pago.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white font-bold h-11"
              onClick={() => selectedTable?.activeSession && handleLiberateTable(selectedTable.activeSession.id)}
              disabled={isClosing}
            >
              {isClosing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
              Sí, Cobrar y Liberar
            </Button>
            <Button variant="outline" className="h-11" onClick={() => setIsConfirmingClose(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Initial Notification Prompt */}
      <Dialog open={showNotificationPrompt} onOpenChange={setShowNotificationPrompt}>
        <DialogContent className="sm:max-w-[400px] text-center p-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-8 h-8 text-primary animate-bounce" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {permissionState === "denied" ? "Permiso Denegado" : "Activar Notificaciones"}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {permissionState === "denied" 
                ? "Has bloqueado las notificaciones en este navegador. Para recibirlas, debes hacer clic en el candado junto a la URL y permitir las notificaciones."
                : "¿Deseas recibir notificaciones en tiempo real cuando un plato esté listo o un cliente necesite atención?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-8">
            {permissionState === "denied" ? (
              <Button 
                className="w-full h-12 font-bold"
                onClick={() => setShowNotificationPrompt(false)}
              >
                Entendido
              </Button>
            ) : (
              <>
                <Button 
                  className="w-full h-12 font-bold text-lg"
                  onClick={requestNotificationPermission}
                >
                  Sí, activar notificaciones
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full h-12 text-muted-foreground"
                  onClick={() => {
                    setShowNotificationPrompt(false);
                    localStorage.setItem("pos-notifications-enabled", "false");
                  }}
                >
                  Ahora no
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
