"use client";

import { Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Table } from "@/app/pos/types";

interface TableCardProps {
  /** Objeto con la información de la mesa */
  table: Table;
  /** Acción a ejecutar al hacer clic en la tarjeta */
  onClick: () => void;
}

/**
 * Representación visual individual de una mesa.
 * Cambia de color según disponibilidad (Verde: Libre, Rojo: Ocupada).
 * Muestra indicadores críticos como alertas de mozo o tiempo en marcha.
 */
export function TableCard({ table, onClick }: TableCardProps) {
  const isOccupied = table.status === "occupied";
  const hasPendingCalls = isOccupied && table.pendingCalls && table.pendingCalls.length > 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2",
        isOccupied ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-2 relative">
        {/* Punto de notificación animado para llamadas de mozo */}
        {hasPendingCalls && (
          <div className="absolute top-2 right-2 w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        )}
        <span className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight w-full px-1 overflow-hidden line-clamp-2">{table.name}</span>
        <Badge variant={isOccupied ? "destructive" : "secondary"} className="text-[10px] uppercase font-black tracking-widest">
          {isOccupied ? "Ocupada" : "Libre"}
        </Badge>
        {isOccupied && (
          <div className="flex flex-col gap-1 items-center">
            <div className="flex items-center gap-1 text-[10px] text-red-600 font-black mt-1 bg-red-100 px-3 py-1 rounded-full">
              <Clock className="w-3 h-3" /> EN MARCHA
            </div>
            {table.pendingCalls && table.pendingCalls.length > 0 && (
              <div className="flex items-center gap-1 text-[10px] text-amber-600 font-black bg-amber-100 px-3 py-1 rounded-full">
                <AlertCircle className="w-3 h-3" /> {table.pendingCalls.length} LLAMADA{table.pendingCalls.length > 1 ? 'S' : ''}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
