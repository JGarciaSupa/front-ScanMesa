import { Copy, Dices, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role, StaffMember } from "./types";

interface StaffDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingStaff: StaffMember | null;
  currentUser: any;
  formData: {
    name: string;
    email: string;
    role: Role;
    password?: string;
    isActive: boolean;
  };
  onFormChange: (data: any) => void;
  onSave: (e: React.FormEvent) => void;
  onGeneratePassword: () => void;
  onCopyToClipboard: () => void;
  submitting: boolean;
}

export function StaffDialog({
  isOpen,
  onOpenChange,
  editingStaff,
  currentUser,
  formData,
  onFormChange,
  onSave,
  onGeneratePassword,
  onCopyToClipboard,
  submitting,
}: StaffDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingStaff ? "Editar Empleado" : "Nuevo Empleado"}
          </DialogTitle>
          <DialogDescription>
            {editingStaff
              ? "Actualiza la información del perfil y sus roles."
              : "Crea un nuevo perfil para tu personal. Define sus credenciales iniciales."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSave} className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              placeholder="Ej. Juan Pérez"
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="juan@ejemplo.com"
              value={formData.email}
              onChange={(e) =>
                onFormChange({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Rol asignado</Label>
            <Select
              value={formData.role}
              onValueChange={(val: Role) =>
                onFormChange({ ...formData, role: val })
              }
              disabled={editingStaff?.id === currentUser?.id}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="waiter">Camarero</SelectItem>
                <SelectItem value="kitchen">Cocina</SelectItem>
              </SelectContent>
            </Select>
            {editingStaff?.id === currentUser?.id && (
              <p className="text-[10px] text-muted-foreground italic">
                No puedes cambiar tu propio rol.
              </p>
            )}
          </div>

          <div className="grid gap-2 mt-2">
            <Label htmlFor="password">
              {editingStaff
                ? "Nueva contraseña (opcional)"
                : "Contraseña temporal"}
            </Label>
            <div className="flex space-x-2">
              <Input
                id="password"
                value={formData.password || ""}
                onChange={(e) =>
                  onFormChange({ ...formData, password: e.target.value })
                }
                placeholder={
                  editingStaff
                    ? "Dejar vacío para no cambiar"
                    : "Generar una contraseña ->"
                }
                className="font-mono bg-accent/50"
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onGeneratePassword}
                title="Generar contraseña aleatoria"
              >
                <Dices className="h-4 w-4" />
              </Button>
              {formData.password && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onCopyToClipboard}
                  title="Copiar al portapapeles"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {editingStaff ? "Guardar cambios" : "Guardar empleado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
