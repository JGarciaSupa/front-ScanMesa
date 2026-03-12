"use client";

import { useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote, Receipt, CheckCircle, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

// Mocks basados en la descripción del requerimiento
const MOCK_GUESTS = [
  { id: "g1", name: "Carlos" },
  { id: "g2", name: "María" }
];

const CURRENT_GUEST_ID = "g1"; // El usuario actual es Carlos

const MOCK_ORDER_ITEMS = [
  { id: "item1", name: "Hamburguesa Clásica", quantity: 1, price: 15.00, guestId: "g1" },
  { id: "item2", name: "Papas Fritas", quantity: 1, price: 5.00, guestId: "g2" },
  { id: "item3", name: "Bebida Cola", quantity: 1, price: 3.50, guestId: "g1" },
  { id: "item4", name: "Postre Volcán", quantity: 1, price: 6.50, guestId: "g2" }
];

export default function CheckoutPage({ params }: { params: Promise<{ tableId: string }> }) {
  // En Next.js 15+, los params asincrónicos pueden ser un Promise en layout/page, hay que desenvolmverlo
  const unwrappedParams = use(params);
  const tableId = unwrappedParams.tableId;
  const router = useRouter();

  // Estados
  const [paymentMode, setPaymentMode] = useState<"part" | "all">("part");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    MOCK_ORDER_ITEMS.filter(item => item.guestId === CURRENT_GUEST_ID).map(item => item.id)
  );
  
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [billingName, setBillingName] = useState("");
  const [billingId, setBillingId] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cálculos de totales
  const grandTotal = useMemo(() => {
    return MOCK_ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, []);

  const totalToPay = useMemo(() => {
    if (paymentMode === "all") return grandTotal;
    return MOCK_ORDER_ITEMS
      .filter(item => selectedIds.includes(item.id))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [paymentMode, selectedIds, grandTotal]);

  // Manejador del checkbox del ticket interactivo
  const toggleItem = (itemId: string) => {
    if (paymentMode === "all") return; // Si paga todo, no dejamos desmarcar individualmente
    setSelectedIds(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  };

  // Simulación del POST a Hono
  const handleCallWaiter = async () => {
    setIsSubmitting(true);
    
    // Aquí iría el fetch real a tu backend Hono
    // const res = await fetch(`/api/checkout`, { method: 'POST', body: JSON.stringify({...}) });
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  // Pantalla de éxito (El mozo está en camino)
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh p-6 text-center bg-slate-50 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-green-100 p-4 rounded-full mb-6">
          <CheckCircle className="w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">¡Listo!</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-[280px]">
          El mozo viene en camino a cobrarte <strong className="text-slate-900 font-bold">€ {totalToPay.toFixed(2)}</strong> en <strong className="text-slate-900 font-bold">{paymentMethod === 'card' ? 'Tarjeta' : 'Efectivo'}</strong>.
        </p>
        <Button 
          variant="outline" 
          size="lg"
          className="w-full max-w-sm rounded-xl border-slate-300 text-slate-700 font-medium hover:bg-slate-100" 
          onClick={() => router.push(`/qr/${tableId}`)}
        >
          Volver al menú
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-slate-50 pb-36 font-sans">
      {/* 1. Cabecera (El Resumen Global) */}
      <header className="bg-white p-6 shadow-sm sticky top-0 z-10 border-b border-slate-100/50">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="-ml-2 hover:bg-slate-100">
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </Button>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Resumen de la Mesa {tableId}</h1>
        </div>
        <div className="text-center">
          <p className="text-4xl font-extrabold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            € {grandTotal.toFixed(2)}
          </p>
          <p className="text-sm font-medium text-slate-500 mt-2">Total de la mesa</p>
          <p className="text-sm text-slate-400 mt-1">Selecciona qué deseas pagar para avisarle al mozo</p>
        </div>
      </header>

      <main className="flex-1 p-5 space-y-8 max-w-lg mx-auto w-full">
        {/* 2. Selector de Modalidad (El Control) */}
        <section className="space-y-4">
          <Tabs defaultValue="part" onValueChange={(v) => setPaymentMode(v as "part" | "all")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-slate-200/50 rounded-xl h-12">
              <TabsTrigger 
                value="part" 
                className="rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
              >
                Pagar mi parte
              </TabsTrigger>
              <TabsTrigger 
                value="all"
                className="rounded-lg font-medium text-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all"
              >
                Pagar toda la cuenta
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        {/* 3. El Ticket Interactivo (La Magia de la División) */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Detalle del consumo</h2>
          <Card className="border-slate-200/60 shadow-sm overflow-hidden rounded-2xl bg-white">
            <div className="divide-y divide-slate-100">
              {MOCK_ORDER_ITEMS.map(item => {
                const guestName = MOCK_GUESTS.find(g => g.id === item.guestId)?.name || "Desconocido";
                const isChecked = paymentMode === "all" || selectedIds.includes(item.id);
                const isOwnItem = item.guestId === CURRENT_GUEST_ID;
                
                return (
                  <div 
                    key={item.id} 
                    className={`flex items-start gap-4 p-4 transition-all duration-200 ${isChecked ? 'bg-white' : 'bg-slate-50/50'} ${paymentMode === "part" ? "cursor-pointer active:scale-[0.99]" : ""}`}
                    onClick={() => paymentMode === "part" && toggleItem(item.id)}
                  >
                    <Checkbox 
                      id={`chk-${item.id}`}
                      checked={isChecked}
                      disabled={paymentMode === "all"}
                      className={`mt-1 h-5 w-5 rounded-[6px] border-slate-300 ${isChecked ? 'data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900' : ''}`}
                      onClick={(e) => e.stopPropagation()}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`font-semibold text-[15px] truncate pr-2 transition-colors ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                          {item.quantity}x {item.name}
                        </p>
                        <p className={`font-bold text-[15px] shrink-0 transition-colors ${isChecked ? 'text-slate-900' : 'text-slate-500'}`}>
                          € {(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <p className={`text-[13px] font-medium mt-1 transition-colors ${isOwnItem ? 'text-blue-600' : 'text-slate-400'}`}>
                        {isOwnItem ? 'Tu pedido' : `Pedido por ${guestName}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        {/* 4. Preferencia de Pago (Para ayudar al mozo) */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">¿Cómo vas a pagar?</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              type="button"
              variant={paymentMethod === "card" ? "default" : "outline"} 
              className={`h-16 text-[15px] rounded-2xl transition-all duration-200 ${paymentMethod === "card" ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setPaymentMethod("card")}
            >
              <CreditCard className={`w-5 h-5 mr-2 ${paymentMethod === "card" ? "text-slate-300" : "text-slate-400"}`} />
              Tarjeta
            </Button>
            <Button 
              type="button"
              variant={paymentMethod === "cash" ? "default" : "outline"} 
              className={`h-16 text-[15px] rounded-2xl transition-all duration-200 ${paymentMethod === "cash" ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setPaymentMethod("cash")}
            >
              <Banknote className={`w-5 h-5 mr-2 ${paymentMethod === "cash" ? "text-slate-300" : "text-slate-400"}`} />
              Efectivo
            </Button>
          </div>
        </section>

        {/* 5. Datos de Facturación (El Acordeón Legal) */}
        <section>
          <Accordion type="single" collapsible className="w-full bg-white rounded-2xl border border-slate-200 px-5 shadow-sm">
            <AccordionItem value="billing" className="border-none">
              <AccordionTrigger className="hover:no-underline text-sm font-semibold text-slate-700 py-5">
                <div className="flex items-center gap-3">
                  <Receipt className="w-[18px] h-[18px] text-slate-400" />
                  <span>¿Necesitas Factura / Comprobante?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-1 pb-5">
                  <div className="space-y-2">
                    <label htmlFor="billingName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Razón Social / Nombre completo</label>
                    <Input 
                      id="billingName" 
                      placeholder="Ej. Empresa S.A. o Juan Pérez"
                      className="rounded-xl h-12 bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                      value={billingName}
                      onChange={(e) => setBillingName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="billingId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">NIF / CIF / RUC</label>
                    <Input 
                      id="billingId" 
                      placeholder="Ej. B12345678"
                      className="rounded-xl h-12 bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                      value={billingId}
                      onChange={(e) => setBillingId(e.target.value)}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      {/* 6. El Footer Flotante (El Llamado a la Acción) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 pb-safe pt-4 px-5 pb-6 z-20">
        <div className="max-w-lg mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total a pagar por ti</span>
            <span className="text-2xl font-extrabold text-slate-900">€ {totalToPay.toFixed(2)}</span>
          </div>
          <Button 
            size="lg" 
            className="w-full h-14 rounded-full text-lg font-bold shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50 disabled:active:scale-100"
            onClick={handleCallWaiter}
            disabled={isSubmitting || totalToPay === 0}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></span>
                Avisando...
              </span>
            ) : "Llamar al mozo para cobrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
