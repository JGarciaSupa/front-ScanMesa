"use client";

import { ReactNode, useState } from "react";
import { Bell, User, MapPin, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { logoutAction } from "@/app/actions/logout";
import { useAuthStore } from "@/store/useAuthStore";
import { usePosStore, PosAlert } from "@/store/usePosStore";
import { useConfigStore } from "@/store/useConfigStore";
import RoleGuard from "@/components/auth/RoleGuard";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PosLayout({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);
  const { alerts, markAsRead, clearAlerts } = usePosStore();
  const { tenantName, logoUrl, fetchConfig } = useConfigStore();
  
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  useEffect(() => {
    fetchConfig();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Simulamos datos del mozo actual
  const waiterName = user?.name || "Camarero";
  const assignedZone = "Terraza";

  const handleLogout = async () => {
    logoutStore();
    await logoutAction();
  };

  const NotificationList = () => (
    <div className="w-[280px] xs:w-[320px] sm:w-[360px] md:w-[400px] flex flex-col max-h-[80vh] sm:max-h-[600px] overflow-hidden bg-white dark:bg-zinc-950 border-0 shadow-none">
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0 bg-white dark:bg-zinc-950 z-10">
        <h3 className="font-bold text-lg">Notificaciones</h3>
        <div className="flex gap-2">
          {unreadAlerts > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary h-8 px-2"
              onClick={() => alerts.forEach(a => !a.isRead && markAsRead(a.id))}
            >
              Leer todas
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-destructive h-8 px-2"
            onClick={clearAlerts}
          >
            Limpiar
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Bell className="h-10 w-10 opacity-20" />
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          <div className="divide-y">
            {alerts.map((alert: PosAlert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative",
                  !alert.isRead && "bg-primary/5 hover:bg-primary/10"
                )}
                onClick={() => markAsRead(alert.id)}
              >
                {!alert.isRead && (
                  <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary" />
                )}
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "mt-1 h-2 w-2 rounded-full shrink-0",
                    alert.type === 'info' && "bg-blue-500",
                    alert.type === 'warning' && "bg-orange-500",
                    alert.type === 'success' && "bg-green-500"
                  )} />
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-sm font-bold leading-none">{alert.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{alert.description}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                      {new Date(alert.timestamp).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <RoleGuard>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Barra de Estado Superior */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg shadow-sm">
          <div className="flex flex-col md:flex-row h-auto md:h-16 items-center px-4 py-3 md:py-0 gap-4 md:gap-0 justify-between max-w-7xl mx-auto w-full">
            
            {/* Izquierda: Mozo y Zona */}
            <div className="flex items-center gap-2 xs:gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-start overflow-hidden">
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border border-slate-200">
                  {logoUrl ? (
                    <AvatarImage src={logoUrl} alt={tenantName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                      {getInitials(tenantName)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">{tenantName}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">SALA / POS</span>
                </div>
              </div>

              <div className="h-8 w-px bg-border hidden md:block shrink-0" />

              <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 sm:gap-2.5 hover:bg-accent hover:text-accent-foreground p-1 rounded-full transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring overflow-hidden">
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-foreground leading-none truncate max-w-[60px] xs:max-w-[100px] sm:max-w-none">{waiterName}</span>
                      <span className="text-[9px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="h-2 w-2 sm:h-3 sm:w-3" /> {assignedZone}
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground ml-0.5 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2 rounded-2xl shadow-xl border-border mt-2" align="start">
                  <div className="p-3 bg-muted/50 rounded-xl mb-2 flex items-center gap-3 border border-border">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{waiterName}</p>
                      <Badge variant="secondary" className="bg-primary/15 text-primary hover:bg-primary/20 text-[10px] px-1.5 py-0 mt-0.5">Camarero</Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-accent-foreground hover:bg-accent h-9 px-3">
                          <User className="mr-2 h-4 w-4" />
                          Editar Perfil
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Perfil</DialogTitle>
                          <DialogDescription>
                            Actualiza tus datos personales y confirma los cambios.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                              Nombre
                            </Label>
                            <Input id="name" defaultValue={waiterName} className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="pin" className="text-right">
                              PIN
                            </Label>
                            <Input id="pin" type="password" placeholder="****" className="col-span-3" />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zone" className="text-right">
                              Zona Preferida
                            </Label>
                            <Input id="zone" defaultValue={assignedZone} className="col-span-3" disabled />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" onClick={() => setIsEditProfileOpen(false)}>Guardar Cambios</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <div className="h-px bg-border my-2" />
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 h-9 px-3"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Notificaciones (Mobile) */}
              <div className="flex md:hidden relative">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button size="icon" variant="ghost" className="relative h-10 w-10 hover:bg-accent hover:text-accent-foreground rounded-full">
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      {unreadAlerts > 0 && (
                        <Badge variant="destructive" className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-bold border-2 border-background">
                          {unreadAlerts}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0 rounded-2xl shadow-2xl border-border overflow-hidden mt-2">
                    <NotificationList />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Derecha: Notificaciones (Desktop) */}
            <div className="hidden md:flex items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="relative h-10 w-10 rounded-full bg-muted/50 hover:bg-accent border border-border transition-colors">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadAlerts > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground border-2 border-background shadow-sm">
                        {unreadAlerts}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-auto p-0 rounded-2xl shadow-2xl border-border overflow-hidden mt-2">
                  <NotificationList />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </header>

        {/* Contenido principal de la página */}
        <main className="flex-1 overflow-auto bg-muted/30">
          {children}
        </main>
      </div>
    </RoleGuard>
  );
}
