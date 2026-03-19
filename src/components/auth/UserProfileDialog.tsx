"use client";

import { useState, useEffect } from "react";
import { User, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { saveStaffAction } from "@/app/actions/staff";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const user = useAuthStore((state) => state.user);
  const setUserStore = useAuthStore((state) => state.setUser);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user && open) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPassword("");
    }
  }, [user, open]);

  const handleSave = async () => {
    if (!user) return;
    if (!name || !email) {
      toast.error("Nombre y Email son requeridos");
      return;
    }

    try {
      setIsUpdating(true);
      const data: any = {
        name,
        email,
      };
      if (password) {
        data.password = password;
      }

      const res = await saveStaffAction(data, user.id);
      if (res.success) {
        toast.success("Perfil actualizado correctamente");
        setUserStore(res.data);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Error al actualizar perfil");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] z-50">
        <DialogHeader>
          <DialogTitle>Mí Perfil</DialogTitle>
          <DialogDescription>
            Actualiza tus datos personales y confirma los cambios.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Nombre</Label>
            <Input 
              id="profile-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input 
              id="profile-email" 
              type="email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="profile-password">Nueva Contraseña</Label>
            <Input 
              id="profile-password" 
              type="password" 
              placeholder="Dejar en blanco para no cambiar" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUpdating}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
