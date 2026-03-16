"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { formatPrice } from "@/lib/utils";

interface ConfirmCloseDialogProps {
  /** Estado de visibilidad del diálogo */
  isOpen: boolean;
  /** Función para controlar la apertura/cierre del diálogo */
  onOpenChange: (open: boolean) => void;
  /** El monto total final que se debe cobrar */
  grandTotal: number;
  /** Indica si la operación de cierre está en proceso (estado de carga) */
  isClosing: boolean;
  /** Función que ejecuta la acción definitiva de cierre de mesa */
  onConfirm: () => void;
}

/**
 * Diálogo de confirmación final antes de cobrar y liberar una mesa.
 * Presenta el total a cobrar de forma destacada y previene cierres accidentales.
 */
export function ConfirmCloseDialog({
  isOpen,
  onOpenChange,
  grandTotal,
  isClosing,
  onConfirm
}: ConfirmCloseDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-8 rounded-[32px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-black tracking-tight">Finalizar servicio</DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Confirma el pago para liberar la mesa y generar el comprobante.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-900 p-6 rounded-[24px] text-white flex justify-between items-center shadow-lg shadow-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total a cobrar</span>
            <span className="text-3xl font-black tracking-tighter">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white font-black h-14 rounded-2xl uppercase tracking-widest shadow-xl shadow-red-100 transition-all active:scale-95"
            onClick={onConfirm}
            disabled={isClosing}
          >
            {isClosing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
            Confirmar y Cerrar Mesa
          </Button>
          <Button variant="ghost" className="h-12 rounded-2xl font-bold text-slate-400" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
