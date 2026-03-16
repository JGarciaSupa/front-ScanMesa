import { 
  MoreVertical, 
  UserPen, 
  KeyRound, 
  UserX, 
  Plus, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { StaffMember, Role } from "../types";

const roleConfig: Record<Role, { label: string, color: string }> = {
  admin: { label: "Admin", color: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  waiter: { label: "Mozo", color: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-blue-800" },
  kitchen: { label: "Cocina", color: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-blue-800" },
};

interface StaffCardProps {
  staff: StaffMember;
  isSelf: boolean;
  onEditProfile: (staff: StaffMember) => void;
  onChangePassword: (staff: StaffMember) => void;
  onToggleActive: (staff: StaffMember) => void;
  onDelete: (id: number) => void;
}

export function StaffCard({
  staff,
  isSelf,
  onEditProfile,
  onChangePassword,
  onToggleActive,
  onDelete
}: StaffCardProps) {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <Card className={`py-0 gap-2 overflow-hidden flex flex-col items-center text-center p-6 relative group transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${!staff.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
      <div className="absolute right-3 top-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100 transition-opacity">
              <span className="sr-only">Abrir menú</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer" onClick={() => onEditProfile(staff)}>
              <UserPen className="mr-2 h-4 w-4" /> Editar perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => onChangePassword(staff)}>
              <KeyRound className="mr-2 h-4 w-4" /> Cambiar contraseña
            </DropdownMenuItem>
            
            {!isSelf && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={`${staff.isActive ? 'text-orange-600' : 'text-green-600'} cursor-pointer`}
                  onClick={() => onToggleActive(staff)}
                >
                  {staff.isActive ? (
                    <><UserX className="mr-2 h-4 w-4" /> Desactivar cuenta</>
                  ) : (
                    <><Plus className="mr-2 h-4 w-4" /> Activar cuenta</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                  onClick={() => onDelete(staff.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Eliminar definitivamente
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative mb-5 mt-2">
        <Avatar className="h-20 w-20 border-2 border-primary/10 shadow-sm">
          <AvatarFallback className="text-xl bg-primary/5 font-semibold text-primary">{getInitials(staff.name)}</AvatarFallback>
        </Avatar>
        <div 
          className={`absolute bottom-0 right-1 h-4 w-4 rounded-full border-2 border-background shadow-sm ${staff.isActive ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
          title={staff.isActive ? "Activo" : "Inactivo"}
        />
        {isSelf && (
          <Badge className="absolute -top-2 -right-2 px-1.5 py-0 text-[9px]" variant="secondary">Tú</Badge>
        )}
      </div>

      <div className="w-full flex-1 flex flex-col items-center">
        <h3 className="font-semibold text-lg truncate w-full px-2" title={staff.name}>{staff.name}</h3>
        <p className="text-sm text-muted-foreground truncate w-full mb-3 px-2" title={staff.email}>{staff.email}</p>
        <div className="mt-auto pt-1 pb-2">
          <Badge variant="outline" className={`font-medium border shadow-sm px-3 py-0.5 ${roleConfig[staff.role].color}`}>
            {roleConfig[staff.role].label}
          </Badge>
        </div>
        {!staff.isActive && (
          <Badge variant="secondary" className="mt-2 text-[10px] uppercase tracking-wider">Inactivo</Badge>
        )}
      </div>
    </Card>
  );
}
