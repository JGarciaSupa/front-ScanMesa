"use client";

import { Wifi, WifiOff, Bell, BellOff, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

interface PosHeaderProps {
  /** Indica si la conexión WebSocket está activa */
  isConnected: boolean;
  /** Estado de habilitación de notificaciones push en el navegador */
  notificationsEnabled: boolean;
  /** Función para alternar el estado de las notificaciones */
  onToggleNotifications: (checked: boolean) => void;
}

/**
 * Componente de cabecera para el POS.
 * Muestra el título de la página, el estado de conexión en tiempo real
 * y el control para activar/desactivar notificaciones del sistema.
 */
export function PosHeader({ isConnected, notificationsEnabled, onToggleNotifications }: PosHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role?.toLowerCase() === "admin";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
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

      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button variant="outline" size="sm" asChild className="font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm rounded-xl h-11 px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              DASHBOARD
            </Link>
          </Button>
        )}
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
              onCheckedChange={onToggleNotifications}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
