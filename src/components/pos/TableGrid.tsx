"use client";

import { Loader2 } from "lucide-react";
import { Table } from "@/app/pos/types";
import { TableCard } from "./TableCard";

interface TableGridProps {
  /** Lista completa de mesas a mostrar */
  tables: Table[];
  /** Indica si los datos de las mesas están cargando */
  loading: boolean;
  /** Función que se ejecuta al seleccionar una mesa de la cuadrícula */
  onTableClick: (table: Table) => void;
}

/**
 * Cuadrícula responsiva que organiza y renderiza las tarjetas de mesas.
 * Maneja el estado de carga inicial mostrando un spinner y un mensaje descriptivo.
 */
export function TableGrid({ tables, loading, onTableClick }: TableGridProps) {
  if (loading && tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="font-bold text-slate-400">Preparando mapa de mesas...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
      {tables.map((table) => (
        <TableCard 
          key={table.id} 
          table={table} 
          onClick={() => onTableClick(table)} 
        />
      ))}
    </div>
  );
}
