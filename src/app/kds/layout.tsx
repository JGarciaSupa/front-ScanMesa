"use client";

import { useState, useEffect, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, BellRing, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function KDSHeaderContent() {
  const router = useRouter();
  const [time, setTime] = useState<string>("");
  const [silentMode, setSilentMode] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);

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

      {/* Derecha: Contador de Pedidos y Menú de Usuario */}
      <div className="flex items-stretch justify-end w-full md:w-auto gap-2.5 md:gap-3.5 mt-2 md:mt-0">
        <div className="flex flex-1 md:flex-none items-center gap-2 md:gap-3 bg-card px-3 md:px-5 py-2.5 md:py-3 rounded-xl border border-border shadow-md group cursor-pointer hover:border-border/80 transition-colors justify-between lg:justify-start min-w-0">
          <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
            <BellRing className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-foreground transition-colors animate-pulse shrink-0" />
            <span className="text-foreground font-bold uppercase tracking-widest text-xs md:text-sm truncate">
              Pendientes
            </span>
          </div>
          <div className="relative flex items-center justify-center shrink-0">
            <span className="absolute -inset-2 rounded-full bg-destructive opacity-20 animate-ping"></span>
            <Badge 
              variant="destructive" 
              className="relative text-destructive-foreground text-base md:text-xl font-black px-2.5 md:px-3 py-0.5 rounded-md leading-none"
            >
              6
            </Badge>
          </div>
        </div>

        {/* Menú de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-full border border-border rounded-xl shadow-md aspect-square bg-card shrink-0 hover:border-border/80 outline-none">
              <User className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 z-50">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Chef: Julio</p>
                <p className="text-xs text-muted-foreground mt-1">Sistema KDS</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between p-2">
              <span className="text-sm font-medium">Modo Silencio</span>
              <Switch checked={silentMode} onCheckedChange={setSilentMode} />
            </div>
            <div className="p-2 space-y-1">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2" 
                onClick={() => setShowProfileDialog(true)}
              >
                <Settings className="w-4 h-4" />
                Mi Perfil
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-2" 
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Diálogo de Confirmación de Cierre de Sesión */}
        <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <DialogContent className="max-w-md sm:max-w-md! z-50">
            <DialogHeader>
              <DialogTitle>¿Estás seguro?</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Se dejarán de recibir alertas en esta pantalla.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={() => {
                setShowLogoutDialog(false);
                router.push("/login");
              }}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Diálogo de Mi Perfil */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="max-w-md sm:max-w-md! z-50">
            <DialogHeader>
              <DialogTitle>Mi Perfil</DialogTitle>
              <DialogDescription className="text-base mt-2">
                Actualiza tu información y clave de acceso al KDS.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="chef-name">Nombre</Label>
                <Input id="chef-name" defaultValue="Julio" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chef-password">Nueva Clave (PIN)</Label>
                <Input id="chef-password" type="password" placeholder="Ingresa un nuevo PIN o clave" />
              </div>
            </div>
            <DialogFooter className="mt-4 sm:justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowProfileDialog(false)}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
