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

          <Button
            type="submit"
            disabled={isLoading || !nameInput.trim() || (isTableOccupied && !isCodePreFilled && codeInput.length < 6)}
            className="h-12 rounded-xl text-lg font-semibold w-full mt-2"
          >
            {isLoading ? "Procesando..." : (isTableOccupied ? "Unirse a la mesa" : "Abrir nueva mesa")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
