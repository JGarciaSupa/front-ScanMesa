"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Siren } from "lucide-react";
import Masonry from "react-masonry-css";

// Interfaces para Mock
type OrderItem = {
  id: string;
  quantity: number;
  name: string;
  notes?: string;
  isReady: boolean;
};

type Order = {
  id: string;
  table: string;
  diner?: string;
  elapsedMinutes: number;
  items: OrderItem[];
};

// Datos Mockeados
const MOCK_ORDERS: Order[] = [
  {
    id: "ord-1",
    table: "MESA 7",
    diner: "Carlos",
    elapsedMinutes: 8,
    items: [
      { id: "i1", quantity: 1, name: "PIZZA PEPPERONI", notes: "¡SIN CEBOLLA!", isReady: false },
      { id: "i2", quantity: 2, name: "COCA COLA ZERO", isReady: true },
    ],
  },
  {
    id: "ord-2",
    table: "MESA 12",
    diner: "Ana",
    elapsedMinutes: 15,
    items: [
      { id: "i3", quantity: 1, name: "BIFE DE CHORIZO", notes: "JUGOSO, MEDIO PUNTO", isReady: false },
      { id: "i4", quantity: 1, name: "ENSALADA MIXTA", isReady: false },
      { id: "i5", quantity: 1, name: "PAPAS FRITAS", isReady: true },
    ],
  },
  {
    id: "ord-3",
    table: "BARRA",
    diner: "Grupo A",
    elapsedMinutes: 25,
    items: [
      { id: "i6", quantity: 3, name: "HAMBURGUESA CLÁS.", isReady: false },
      { id: "i7", quantity: 1, name: "NACHOS CON QUESO", notes: "EXTRA JALAPEÑO", isReady: false },
    ],
  },
  {
    id: "ord-4",
    table: "MESA 4",
    diner: "Luis",
    elapsedMinutes: 2,
    items: [
      { id: "i8", quantity: 2, name: "PASTA CARBONARA", isReady: false },
      { id: "i9", quantity: 1, name: "TIRAMISÚ", isReady: false },
    ],
  },
  {
    id: "ord-41",
    table: "MESA 41",
    diner: "Pablo",
    elapsedMinutes: 2,
    items: [
      { id: "i8", quantity: 2, name: "PASTA CARBONARA", isReady: false },
      { id: "i9", quantity: 1, name: "TIRAMISÚ", isReady: false },
    ],
  },
  {
    id: "ord-42",
    table: "MESA 42",
    diner: "Juan",
    elapsedMinutes: 2,
    items: [
      { id: "i8", quantity: 2, name: "PASTA CARBONARA", isReady: false },
      { id: "i9", quantity: 1, name: "TIRAMISÚ", isReady: false },
    ],
  },
];

export default function KDSPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  useEffect(() => {
    // console.log("🔔 Beep! Nuevo pedido o actualización.");
  }, []);

  const toggleItemReady = useCallback((orderId: string, itemId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          items: ord.items.map((item) =>
            item.id === itemId ? { ...item, isReady: !item.isReady } : item
          ),
        };
      })
    );
  }, []);

  const markOrderReady = useCallback((orderId: string) => {
    setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
  }, []);

  const getTimeColorSet = (minutes: number) => {
    if (minutes >= 20) {
      return {
        cardClass: "border-destructive bg-destructive/10",
        headerClass: "bg-destructive text-destructive-foreground",
        icon: <Siren className="w-5 h-5 animate-pulse" />,
      };
    }
    if (minutes >= 10) {
      return {
        cardClass: "border-orange-500/50 bg-orange-500/5",
        headerClass: "bg-orange-500 text-primary-foreground",
        icon: <Clock className="w-5 h-5" />,
      };
    }
    return {
      cardClass: "border-border bg-card",
      headerClass: "bg-muted text-muted-foreground",
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

  return (
    <div className="w-full pb-6">
      {orders.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center text-muted-foreground gap-4 mt-20">
          <CheckCircle2 className="w-24 h-24 text-muted" />
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-center">¡Todos los pedidos están listos!</h2>
          <p className="text-lg md:text-xl text-center">La cocina está al día.</p>
        </div>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-auto gap-3 md:gap-4"
          columnClassName="bg-clip-padding flex flex-col gap-3 md:gap-4"
        >
          {orders.map((order) => {
            const colors = getTimeColorSet(order.elapsedMinutes);
            const allItemsReady = order.items.every((i) => i.isReady);

            return (
              <Card
                key={order.id}
                className={`gap-0 py-0 flex flex-col overflow-hidden shadow-md transition-all duration-300 w-full ${colors.cardClass}`}
              >
                <CardHeader className={`px-3 py-2.5 md:px-4 md:py-3 flex flex-row items-center justify-between space-y-0 gap-2 shrink-0 ${colors.headerClass}`}>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-xl md:text-2xl font-black uppercase tracking-widest leading-none truncate">
                      {order.table}
                    </span>
                    {order.diner && (
                      <span className="text-xs md:text-sm font-bold opacity-90 uppercase tracking-wider truncate">
                        Pedido de: {order.diner}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-lg md:text-xl font-bold bg-background/20 px-2.5 py-1 rounded-md shadow-inner shrink-0 leading-none">
                    {colors.icon}
                    {order.elapsedMinutes} min
                  </div>
                </CardHeader>
  
                <CardContent className="p-0 px-0 sm:px-0 bg-card border-none">
                  <div className="divide-y divide-border">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemReady(order.id, item.id)}
                        className={`flex items-start gap-3 p-3 md:p-4 cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted ${
                          item.isReady ? "opacity-50" : "opacity-100"
                        }`}
                      >
                        <div className="pt-0.5 pointer-events-none shrink-0">
                          <Checkbox
                            checked={item.isReady}
                            className={`w-6 h-6 md:w-7 md:h-7 rounded-sm transition-all`}
                          />
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                          <div
                            className={`text-lg font-bold uppercase leading-snug wrap-break-word transition-all ${
                              item.isReady ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            <span className="font-black text-primary mr-2">
                              {item.quantity}x
                            </span>
                            {item.name}
                          </div>
  
                          {item.notes && !item.isReady && (
                            <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/30 font-bold uppercase tracking-widest text-[11px] md:text-xs px-2.5 py-1 w-fit mt-1">
                              ⚠️ {item.notes}
                            </Badge>
                          )}
                          {item.notes && item.isReady && (
                            <Badge variant="outline" className="text-muted-foreground font-bold uppercase tracking-widest text-[11px] md:text-xs px-2.5 py-1 w-fit line-through mt-1">
                              {item.notes}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
  
                <CardFooter className="p-3 md:p-4 bg-muted/30 border-t border-border shrink-0">
                  <Button
                    onClick={() => markOrderReady(order.id)}
                    size="lg"
                    variant={allItemsReady ? "default" : "secondary"}
                    className={`w-full h-12 md:h-14 text-sm md:text-base font-bold uppercase tracking-widest transition-all active:scale-95 ${
                      allItemsReady ? "shadow-lg" : ""
                    }`}
                  >
                    <CheckCircle2 className={`w-6 h-6 md:w-7 md:h-7 mr-2 md:mr-3 ${allItemsReady ? "animate-bounce" : ""}`} />
                    {allItemsReady ? "DESPACHAR" : "MARCAR LISTA"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </Masonry>
      )}
    </div>
  );
}
