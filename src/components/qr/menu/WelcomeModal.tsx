"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CheckCircle2 } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  tableName: string;
  tableId: string;
  isTableOccupied: boolean;
  isCodePreFilled: boolean;
  nameInput: string;
  setNameInput: (val: string) => void;
  codeInput: string;
  setCodeInput: (val: string) => void;
  isLoading: boolean;
  handleJoin: (e: React.FormEvent) => void;
  locationStatus?: 'idle' | 'checking' | 'authorized' | 'denied' | 'out_of_range';
}

export default function WelcomeModal({
  isOpen,
  tableName,
  tableId,
  isTableOccupied,
  isCodePreFilled,
  nameInput,
  setNameInput,
  codeInput,
  setCodeInput,
  isLoading,
  handleJoin,
  locationStatus,
}: WelcomeModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-md w-11/12 rounded-xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">¡Bienvenido a la {tableName || `Mesa ${tableId}`}!</DialogTitle>
          <DialogDescription className="text-center pt-2 pb-4 text-base">
            {isTableOccupied 
              ? isCodePreFilled 
                ? "Te invitó alguien a esta mesa. Escribe tu nombre para entrar."
                : "Esta mesa ya está ocupada. Ingresa tu nombre y el código de invitación que te enviaron."
              : "Parece que eres el primero aquí. Escribe tu nombre para abrir la mesa."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleJoin} className="flex flex-col gap-5">
          <Input
            placeholder="Tu nombre (Ej. Ana)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="h-12 text-lg rounded-xl"
            autoFocus
          />
          
          {isTableOccupied && !isCodePreFilled && (
            <div className="flex flex-col items-center justify-center gap-3">
              <span className="text-sm font-medium text-zinc-500">Código de mesa (6 dígitos)</span>
              <InputOTP 
                maxLength={6} 
                value={codeInput}
                onChange={(val) => setCodeInput(val)}
                required
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-10 h-12 text-lg border border-zinc-200 font-bold rounded-xl!" />
                  <InputOTPSlot index={1} className="w-10 h-12 text-lg border border-zinc-200 font-bold rounded-xl!" />
                  <InputOTPSlot index={2} className="w-10 h-12 text-lg border border-zinc-200 font-bold rounded-xl!" />
                  <InputOTPSlot index={3} className="w-10 h-12 text-lg border border-zinc-200 font-bold rounded-xl!" />
                  <InputOTPSlot index={4} className="w-10 h-12 text-lg border border-zinc-200 font-bold rounded-xl!" />
                  <InputOTPSlot index={5} className="w-10 h-12 text-lg border border-zinc-200 font-bold rounded-xl!" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}

          {isTableOccupied && isCodePreFilled && (
            <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium border border-green-200/50">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Invitación válida detectada
            </div>
          )}

          {locationStatus === 'out_of_range' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium border border-red-200/50">
                <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span className="font-bold">Fuera del rango permitido</span>
                </div>
                <p className="text-center opacity-80 pb-2">Debes estar físicamente en el restaurante para realizar pedidos o reservar.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => window.location.reload()}
                >
                  Reintentar verificación
                </Button>
            </div>
          )}

          {locationStatus === 'denied' && (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium border border-amber-200/50">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    <span className="font-bold">Acceso a GPS denegado</span>
                </div>
                <p className="text-center opacity-80 pb-2">Para continuar, por favor permite el acceso a tu ubicación en los ajustes de tu navegador.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => window.location.reload()}
                >
                  Intentar de nuevo
                </Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !nameInput.trim() || (isTableOccupied && !isCodePreFilled && codeInput.length < 6) || locationStatus === 'out_of_range' || locationStatus === 'denied'}
            className="h-12 rounded-xl text-lg font-semibold w-full mt-2"
          >
            {isLoading ? "Procesando..." : (isTableOccupied ? "Unirse a la mesa" : "Abrir nueva mesa")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
