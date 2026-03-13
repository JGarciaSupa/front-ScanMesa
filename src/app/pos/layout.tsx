"use client";

import { ReactNode, useState } from "react";
import { Bell, User, MapPin, ChevronDown, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { logoutAction } from "@/app/actions/logout";
import { useAuthStore } from "@/store/useAuthStore";

import RoleGuard from "@/components/auth/RoleGuard";

export default function PosLayout({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logoutStore = useAuthStore((state) => state.logout);

  // Simulamos datos del mozo actual
  const waiterName = user?.name || "Camarero";
  const assignedZone = "Terraza";
  const unreadAlerts = 3;

  const handleLogout = async () => {
    logoutStore();
    await logoutAction();
  };

  return (
    <RoleGuard>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Barra de Estado Superior */}
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg shadow-sm">
          <div className="flex flex-col md:flex-row h-auto md:h-16 items-center px-4 py-3 md:py-0 gap-4 md:gap-0 justify-between max-w-7xl mx-auto w-full">
            
            {/* Izquierda: Mozo y Zona */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              
              <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2.5 hover:bg-accent hover:text-accent-foreground p-1.5 pr-3 rounded-full transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-foreground leading-none">{waiterName}</span>
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> {assignedZone}
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
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
                <Button size="icon" variant="ghost" className="relative h-10 w-10 hover:bg-accent hover:text-accent-foreground rounded-full">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  {unreadAlerts > 0 && (
                    <Badge variant="destructive" className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px] font-bold border-2 border-background">
                      {unreadAlerts}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Centro: Filtros de estado (Pills) */}
            <div className="w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <Tabs defaultValue="all" className="w-full justify-start md:justify-center">
                <TabsList className="bg-muted/80 p-1 border border-border">
                  <TabsTrigger value="all" className="text-[13px] font-medium px-4 h-8 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Todas</TabsTrigger>
                  <TabsTrigger value="occupied" className="text-[13px] font-medium px-4 h-8 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">Ocupadas</TabsTrigger>
                  <TabsTrigger value="attention" className="text-[13px] font-medium px-4 h-8 rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm relative">
                    Pidiendo Cuenta
                    <span className="ml-1.5 flex h-1.5 w-1.5 rounded-full bg-destructive"></span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Derecha: Notificaciones (Desktop) */}
            <div className="hidden md:flex items-center">
              <Button size="icon" variant="ghost" className="relative h-10 w-10 rounded-full bg-muted/50 hover:bg-accent border border-border transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground border-2 border-background shadow-sm">
                    {unreadAlerts}
                  </span>
                )}
              </Button>
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
