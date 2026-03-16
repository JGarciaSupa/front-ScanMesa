import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StaffHeaderProps {
  onAddStaff: () => void;
}

export function StaffHeader({ onAddStaff }: StaffHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">Gestión de Personal</h2>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Administra los roles, accesos y permisos de tu equipo.</p>
      </div>
      
      <Button className="w-full sm:w-auto shadow-sm" onClick={onAddStaff}>
        <Plus className="mr-2 h-4 w-4" /> Agregar Empleado
      </Button>
    </div>
  );
}
