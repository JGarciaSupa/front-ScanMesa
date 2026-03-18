"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { getPosTablesAction } from "@/app/actions/pos";
import { 
  closeSessionAction, 
  getSessionItemsAction, 
  markItemServedAction, 
  markOrderCompleteAction, 
  resolveWaiterCallAction 
} from "@/app/actions/orders";
import { getSocketConfigAction } from "@/app/actions/socket-config";
import { usePosStore } from "@/store/usePosStore";

// Tipos compartidos
import { Table, OrderItem } from "./types";

// Componentes del POS extrados para mejor mantenimiento
import { PosHeader } from "@/components/pos/PosHeader";
import { TableGrid } from "@/components/pos/TableGrid";
import { TableDetailModal } from "@/components/pos/TableDetailModal";
import { ConfirmCloseDialog } from "@/components/pos/ConfirmCloseDialog";
import { NotificationPrompt } from "@/components/pos/NotificationPrompt";

/**
 * Página Principal del Punto de Venta (POS).
 * 
 * Gestiona el ciclo de vida completo de la atención en salón:
 * 1. Monitorea el estado de las mesas mediante WebSockets.
 * 2. Gestiona las llamadas de mozo y pedidos en tiempo real.
 * 3. Controla el flujo de cobro y liberación de mesas.
 * 4. Administra el sistema de notificaciones push del navegador.
 */
export default function PosPage() {
  // --- Estados de Datos ---
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [tableItems, setTableItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  
  // --- Estados de UI / Modales ---
  const [isConfirmingClose, setIsConfirmingClose] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [, setPermissionState] = useState<NotificationPermission>("default");  
  
  // --- Refs para lógica persistente ---
  const socketRef = useRef<WebSocket | null>(null);
  const selectedSessionIdRef = useRef<number | null>(null);
  const notificationsEnabledRef = useRef(false);
  const addAlert = usePosStore((state) => state.addAlert);

  // Sincronizar el ref de notificaciones para evitar cierres obsoletos en el WebSocket
  useEffect(() => {
    notificationsEnabledRef.current = notificationsEnabled;
  }, [notificationsEnabled]);

  // Inicialización de preferencias de notificación
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const currentPermission = Notification.permission;
      setPermissionState(currentPermission);
      
      const storedPref = localStorage.getItem("pos-notifications-enabled");
      
      if (currentPermission === "granted") {
        setNotificationsEnabled(storedPref !== "false");
      } 
      else if (currentPermission === "default" && storedPref !== "false") {
        const timer = setTimeout(() => setShowNotificationPrompt(true), 1500);
        return () => clearTimeout(timer);
      }
    }
    selectedSessionIdRef.current = selectedTable?.activeSession?.id || null;
  }, [selectedTable?.activeSession?.id]);

  // --- Lógica de Notificaciones ---
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
    if (notificationsEnabledRef.current && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        const notification = new Notification(title, { 
          body,
          icon: '/icon-192x192.png',
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

  // --- Acciones de Datos ---
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

  const fetchSessionItems = async (sessionId: number) => {
    try {
      setLoadingItems(true);
      const result = await getSessionItemsAction(sessionId);
      if (result.success) {
        setTableItems(result.data);
      }
    } catch (error) { console.error(error); } finally { setLoadingItems(false); }
  };

  // --- Lógica de WebSocket ---
  useEffect(() => {
    let mounted = true;
    let reconnectTimeout: any;

    async function initSocket() {
      try {
        const config = await getSocketConfigAction();
        if (!mounted) return;
        
        // Antes de crear uno nuevo, nos aseguramos de limpiar el anterior
        if (socketRef.current) {
          socketRef.current.onclose = null;
          socketRef.current.onmessage = null;
          socketRef.current.onopen = null;
          socketRef.current.close();
        }

        const wsUrl = new URL(`${config.url.replace('http', 'ws')}/ws`);
        wsUrl.searchParams.set('token', config.token || '');
        wsUrl.searchParams.set('tenantId', config.slug || '');

        const socket = new WebSocket(wsUrl.toString());
        socketRef.current = socket;

        socket.onopen = () => {
          if (!mounted) return;
          setIsConnected(true);
          // Refrescar datos al conectar/reconectar para no perder actualizaciones
          fetchTables();
        };

        socket.onclose = () => {
          setIsConnected(false);
          if (mounted) {
            // Reintento exponencial o fijo. Bajamos a 2s para ser más ágiles
            reconnectTimeout = setTimeout(initSocket, 2000);
          }
        };

        socket.onerror = (error) => {
          console.error("WebSocket Error:", error);
          // onclose se encargará de la reconexión
        };

        socket.onmessage = (event) => {
          if (!mounted) return;
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
              sendPushNotification("¡Llamada de Camarero!", `Mesa ${data.tableId}: ${data.reason}`);
              addAlert({ title: "¡Llamada de Camarero!", description: `Mesa ${data.tableId}: ${data.reason}`, type: "warning" });
            }

            if (eventName === 'checkout:requested') {
              toast.success(`¡Solicitud de cuenta!`, { description: `Mesa ${data.tableId} solicita pagar.`, duration: 10000 });
              sendPushNotification("¡Solicitud de Cuenta!", `Mesa ${data.tableId} solicita su cuenta.`);
              addAlert({ title: "¡Solicitud de Cuenta!", description: `Mesa ${data.tableId} solicita su cuenta.`, type: "success" });
              fetchTables();
            }
          } catch (e) {
            console.error("Error parsing WS message:", e);
          }
        };
      } catch (err) {
        console.error("Error initializing socket:", err);
        if (mounted) reconnectTimeout = setTimeout(initSocket, 5000);
      }
    }

    initSocket();
    fetchTables();

    // Manejador para recuperar la conexión cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN)) {
        console.log('[POS] Tab enfocada, refrescando conexión...');
        initSocket();
        fetchTables();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => { 
      mounted = false; 
      clearTimeout(reconnectTimeout); 
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
    };
  }, [fetchTables, addAlert]);

  // --- Manejadores de Eventos ---
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

  const grandTotal = tableItems.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      {/* Cabecera con estado de conexión y notificaciones */}
      <PosHeader 
        isConnected={isConnected}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />

      {/* Cuadrícula de mesas del salón */}
      <TableGrid 
        tables={tables}
        loading={loading}
        onTableClick={handleOpenTable}
      />

      {/* Detalle de la mesa seleccionada, consumos y llamadas */}
      <TableDetailModal 
        table={selectedTable}
        isOpen={!!selectedTable}
        onClose={() => setSelectedTable(null)}
        loadingItems={loadingItems}
        tableItems={tableItems}
        grandTotal={grandTotal}
        onResolveCall={handleResolveWaiterCall}
        onMarkAsServed={handleMarkAsServed}
        onOpenCloseConfirm={() => setIsConfirmingClose(true)}
      />

      {/* Diálogo de cobro final */}
      <ConfirmCloseDialog 
        isOpen={isConfirmingClose}
        onOpenChange={setIsConfirmingClose}
        grandTotal={grandTotal}
        isClosing={isClosing}
        onConfirm={() => selectedTable?.activeSession && handleLiberateTable(selectedTable.activeSession.id)}
      />

      {/* Invitación a activar notificaciones del navegador */}
      <NotificationPrompt 
        isOpen={showNotificationPrompt}
        onOpenChange={setShowNotificationPrompt}
        onRequestPermission={requestNotificationPermission}
        onCancel={() => {
          setShowNotificationPrompt(false);
          localStorage.setItem("pos-notifications-enabled", "false");
          toast.info("Puedes activarlas luego desde el menú superior.");
        }}
      />
    </div>
  );
}
