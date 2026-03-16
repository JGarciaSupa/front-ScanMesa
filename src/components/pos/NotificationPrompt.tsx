"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface NotificationPromptProps {
  /** Indica si el prompt debe mostrarse */
  isOpen: boolean;
  /** Función para controlar la apertura/cierre del prompt */
  onOpenChange: (open: boolean) => void;
  /** Función que solicita los permisos nativos de notificación al navegador */
  onRequestPermission: () => void;
  /** Acción a tomar si el usuario decide no activar las notificaciones en ese momento */
  onCancel: () => void;
}

/**
 * Diálogo informativo diseñado para animar al usuario a activar las notificaciones push.
 * Explica brevemente los beneficios de habilitarlas para la operativa del restaurante.
 */
export function NotificationPrompt({
  isOpen,
  onOpenChange,
  onRequestPermission,
  onCancel
}: NotificationPromptProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-8 rounded-[32px] border-none shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
            <Bell className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-black tracking-tight">Activar Notificaciones</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium px-4">
              Recibe alertas en tiempo real cuando un plato esté listo, un cliente llame al mozo o soliciten la cuenta.
            </DialogDescription>
          </div>
          <div className="flex flex-col w-full gap-3 pt-4">
            <Button 
              className="h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all active:scale-95"
              onClick={onRequestPermission}
            >
              Permitir Notificaciones
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 rounded-2xl font-bold text-slate-400"
              onClick={onCancel}
            >
              Quizás más tarde
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
