"use client";

import { useState, useEffect, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, LayoutGrid, Flame, Pizza, BellRing, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function KDSHeaderContent() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-card border-b border-border flex flex-col md:flex-row items-center justify-between px-4 lg:px-6 py-4 shrink-0 shadow-lg z-20 w-full relative gap-4">
      {/* Izquierda: Menú Mobile, Nombre local y Reloj */}
      <div className="flex items-center justify-between w-full md:w-auto gap-4 lg:gap-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden text-muted-foreground hover:text-foreground hover:bg-muted">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background border-border text-foreground p-6">
              <SheetHeader>
                <SheetTitle className="text-left font-black uppercase tracking-widest mb-6">Filtros KDS</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="justify-start gap-3 bg-card border-border text-foreground hover:bg-muted h-14 text-lg font-bold">
                  <LayoutGrid className="w-5 h-5 text-blue-500" />
                  TODO
                </Button>
                <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted h-14 text-lg font-bold">
                  <Flame className="w-5 h-5 text-orange-500" />
                  PARRILLA
                </Button>
                <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted h-14 text-lg font-bold">
                  <Pizza className="w-5 h-5 text-yellow-500" />
                  PIZZAS
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground uppercase flex items-center gap-2">
              <span>LA COCINA</span> 
              <Flame className="w-6 h-6 text-orange-600 fill-orange-600 hidden sm:block" />
            </h1>
            <p className="text-muted-foreground font-medium tracking-widest text-xs uppercase hidden sm:block">Sistema KDS</p>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 bg-muted/30 px-3 py-2 md:px-5 md:py-2.5 rounded-xl border border-border shadow-inner shrink-0 leading-none">
          <Clock className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground hidden sm:block" />
          <span className="text-2xl md:text-4xl font-mono font-bold tracking-tight text-primary min-w-[120px] md:min-w-[160px] text-center leading-none">
            {time || "00:00:00"}
          </span>
        </div>
      </div>

      {/* Derecha: Contador de Pedidos */}
      <div className="flex justify-end w-full md:w-auto">
        <div className="flex items-center gap-3 bg-card px-4 py-2 md:px-5 md:py-3 rounded-xl border border-border shadow-md group cursor-pointer hover:border-border/80 transition-colors w-full md:w-auto justify-between lg:justify-start shrink-0">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors animate-pulse" />
            <span className="text-foreground font-bold uppercase tracking-widest text-sm md:text-sm">
              Pendientes
            </span>
          </div>
          <div className="relative flex items-center justify-center">
            <span className="absolute -inset-2 rounded-full bg-destructive opacity-20 animate-ping"></span>
            <Badge 
              variant="destructive" 
              className="relative text-destructive-foreground text-lg md:text-xl font-black px-3 py-0.5 rounded-md"
            >
              6
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function KDSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark h-screen overflow-hidden bg-background text-foreground flex flex-col font-sans">
      <Suspense fallback={<div className="h-20 bg-muted border-b border-border" />}>
        <KDSHeaderContent />
      </Suspense>
      {/* Container Principal: Toma el alto restante exacto permitiendo scroll vertical solo aquí */}
      <main className="flex-1 w-full p-4 lg:p-6 pb-2 lg:pb-4 border-t border-border overflow-y-auto custom-scrollbar">
        {children}
      </main>
    </div>
  );
}
