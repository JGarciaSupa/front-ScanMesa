import { Loader2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StaffCard } from "./StaffCard";
import { StaffMember } from "./types";

interface StaffGridProps {
  loading: boolean;
  staffMembers: StaffMember[];
  currentUser: any;
  onEditProfile: (staff: StaffMember) => void;
  onChangePassword: (staff: StaffMember) => void;
  onToggleActive: (staff: StaffMember) => void;
  onDelete: (id: number) => void;
  onClearFilters: () => void;
}

export function StaffGrid({
  loading,
  staffMembers,
  currentUser,
  onEditProfile,
  onChangePassword,
  onToggleActive,
  onDelete,
  onClearFilters
}: StaffGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando personal...</p>
      </div>
    );
  }

  if (staffMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-muted/20 border-dashed mt-4">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <UserX className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No se encontraron empleados</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          No hay ningún miembro del personal que coincida con tu búsqueda. Intenta con otros términos o cambia el filtro de rol.
        </p>
        <Button variant="link" className="mt-2" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {staffMembers.map((staff) => (
        <StaffCard
          key={staff.id}
          staff={staff}
          isSelf={currentUser?.id === staff.id}
          onEditProfile={onEditProfile}
          onChangePassword={onChangePassword}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
