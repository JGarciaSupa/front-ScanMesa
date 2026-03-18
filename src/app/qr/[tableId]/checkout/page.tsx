"use client";

import { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Receipt,
  CheckCircle,
  ChevronLeft,
  Loader2,
  ArrowRight,
  Clock,
  Bell,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice } from "@/lib/utils";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string | number;
  guestId: number;
  guestName: string;
}

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const unwrappedParams = use(params);
  const tableHash = unwrappedParams.tableId;
  const router = useRouter();

  // Estados de sesión
  const [guestId, setGuestId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [tableName, setTableName] = useState("");
  const [internalTableId, setInternalTableId] = useState<number | null>(null);
  const [currency, setCurrency] = useState("$");

  // Estados de datos
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getTenantSlug = () => {
    if (typeof window === "undefined") return "";
    const host = window.location.hostname;
    const subDomain = host.split(".")[0] ?? "";
    return subDomain.replace("-", "_");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tenantSlug = getTenantSlug();

        // 1. Obtener info del Restaurante (Ajustes) y Mesa
        const [settingsRes, tableRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/tenant/settings`, {
            headers: { "x-schema-tenant": tenantSlug },
          }),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/tenant/tables/hash/${tableHash}`,
            {
              headers: { "x-schema-tenant": tenantSlug },
            },
          ),
        ]);

        const settingsData = await settingsRes.json();
        if (settingsData.success) {
          setCurrency(settingsData.data.currency || "$");
        }

        const tableData = await tableRes.json();
        if (tableData.success && tableData.data) {
          setTableName(tableData.data.name);
          setInternalTableId(tableData.data.id);
        }

        // 2. Obtener sesión de localStorage
        const savedSession = localStorage.getItem(`table_session_${tableHash}`);
        if (!savedSession) {
          router.push(`/qr/${tableHash}`);
          return;
        }

        const { guestId: sGuestId, sessionId: sSessionId } =
          JSON.parse(savedSession);
        setGuestId(sGuestId);
        setSessionId(sSessionId);

        // 3. Obtener items
        if (sSessionId) {
          const itemsRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/tenant/orders/session/${sSessionId}/items`,
            {
              headers: { "x-schema-tenant": tenantSlug },
            },
          );
          const itemsData = await itemsRes.json();
          if (itemsData.success) {
            setOrderItems(itemsData.data);
          }
        }
      } catch (error) {
        console.error("Error fetching checkout data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [tableHash, router]);

  // WebSocket para detectar cierre de mesa
  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;
    let socket: WebSocket | null = null;
    let reconnectTimeout: any;

    const initSocket = () => {
      try {
        const tenantSlug = getTenantSlug();
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const wsUrl = new URL(`${apiUrl.replace(/^http/, "ws")}/ws`);
        wsUrl.searchParams.set("tenantId", tenantSlug);
        wsUrl.searchParams.set("isGuest", "true");

        if (socket) {
          socket.onclose = null;
          socket.onmessage = null;
          socket.close();
        }

        socket = new WebSocket(wsUrl.toString());

        socket.onmessage = (event) => {
          if (!mounted) return;
          try {
            const { event: eventName, data } = JSON.parse(event.data);
            if (
              eventName === "session:closed" &&
              data.sessionId === sessionId
            ) {
              localStorage.removeItem(`table_session_${tableHash}`);
              router.push(`/qr/${tableHash}`);
            }
          } catch (e) {
            console.error("[WS Checkout] Error:", e);
          }
        };

        socket.onclose = () => {
          if (mounted) reconnectTimeout = setTimeout(initSocket, 3000);
        };

        socket.onerror = (err) => {
          console.error("[WS Checkout] Error:", err);
        };
      } catch (err) {
        console.error("[WS Checkout] Init error:", err);
        if (mounted) reconnectTimeout = setTimeout(initSocket, 5000);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [sessionId, tableHash, router]);

  const grandTotal = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
  }, [orderItems]);

  const handleCallWaiterToPay = async () => {
    if (!internalTableId) return;
    setIsSubmitting(true);

    try {
      const tenantSlug = getTenantSlug();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/tenant/orders/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-schema-tenant": tenantSlug,
          },
          body: JSON.stringify({
            tableId: internalTableId,
            items: orderItems.map((i) => i.id),
          }),
        },
      );

      if (response.ok) {
        setIsSuccess(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error calling waiter:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-white">
        <Loader2 className="w-12 h-12 text-slate-900 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Cargando tu cuenta...
        </p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-8 text-center bg-white animate-in fade-in duration-700">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
          <div className="relative bg-green-500 p-6 rounded-full shadow-xl shadow-green-200">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          ¡Pedido enviado!
        </h1>

        <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl mb-8 w-full max-w-sm">
          <p className="text-slate-500 text-sm uppercase font-bold tracking-widest mb-1">
            Monto total
          </p>
          <p className="text-4xl font-black text-slate-900 mb-4">
            {formatPrice(grandTotal)}
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-600 bg-white border border-slate-200 py-3 px-4 rounded-md">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold">
              El camarero está en camino
            </span>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-10 max-w-xs mx-auto">
          Por favor, espera un momento. El camarero traerá la cuenta a tu mesa.
        </p>

        <Button
          variant="outline"
          size="lg"
          className="w-full max-w-sm h-12 rounded-md border-2 border-slate-200 text-slate-900 font-black hover:bg-slate-50 active:scale-95 transition-all"
          onClick={() => router.push(`/qr/${tableHash}`)}
        >
          Volver al menú
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-white pb-40 font-sans selection:bg-slate-900 selection:text-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md px-6 py-6 sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-3 rounded-full hover:bg-slate-50"
          >
            <ChevronLeft className="w-6 h-6 text-slate-900" />
          </Button>
          <Badge className="bg-slate-900 text-white font-bold py-1 px-3 rounded-full border-none">
            {tableName || `Mesa ${tableHash}`}
          </Badge>
          <div className="w-10"></div>
        </div>

        <div className="text-center animate-in slide-in-from-top-4 duration-500">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
            Total a pagar
          </p>
          <p className="text-5xl font-black text-slate-900 tracking-tighter">
            {formatPrice(grandTotal)}
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 pt-8 space-y-8 max-w-lg mx-auto w-full">
        {/* Detalle de Productos */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[13px] font-black text-slate-400 uppercase tracking-widest">
              Resumen de la mesa
            </h2>
          </div>

          <div className="bg-slate-50 rounded-[32px] p-2 space-y-1">
            {orderItems.length > 0 ? (
              orderItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-bold text-slate-900 text-sm md:text-base line-clamp-2 wrap-break-word">
                      {item.quantity}x {item.name}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                      Ordenado por {item.guestName}
                    </p>
                  </div>
                  <p className="font-black text-slate-900 text-sm md:text-base shrink-0">
                    {formatPrice(Number(item.price) * item.quantity)}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-16 text-center">
                <Receipt className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-bold text-sm">
                  No hay consumos registrados
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start gap-4">
          <div className="bg-blue-500 p-2 rounded-xl shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-blue-900 text-sm mb-1">¿Cómo pagar?</p>
            <p className="text-blue-700/70 text-xs leading-relaxed">
              Al presionar el botón de abajo, avisaremos al camarero que deseas
              pagar. Él vendrá a tu mesa para procesar el pago.
            </p>
          </div>
        </div>

        <div className="h-10"></div>
      </main>

      {/* Footer Fijo Simplificado */}
      <div className="fixed bottom-0 left-0 right-0 p-6 z-20">
        <div className="max-w-lg mx-auto">
          <Button
            size="lg"
            className={cn(
              "w-full h-12 rounded-md font-black uppercase tracking-widest shadow-2xl",
              grandTotal === 0
                ? "bg-slate-100 text-slate-300"
                : "bg-slate-900 text-white hover:bg-slate-800",
            )}
            onClick={handleCallWaiterToPay}
            disabled={isSubmitting || grandTotal === 0}
          >
            {isSubmitting ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="flex items-center gap-3">
                Pedir la cuenta al camarero
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
