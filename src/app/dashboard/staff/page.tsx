"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPen, 
  KeyRound, 
  UserX, 
  Dices,
  Copy,
  Loader2,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { getStaffAction, saveStaffAction, deleteStaffAction } from "@/app/actions/staff";
import { useAuthStore } from "@/store/useAuthStore";

type Role = "admin" | "waiter" | "kitchen";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const roleConfig: Record<Role, { label: string, color: string }> = {
  admin: { label: "Admin", color: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  waiter: { label: "Mozo", color: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" },
  kitchen: { label: "Cocina", color: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800" },
};

export default function StaffManagementPage() {
  const { user: currentUser } = useAuthStore();
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  // Dialog / Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "waiter" as Role,
    password: "",
    isActive: true
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStaffAction();
      if (res.success) {
        setStaffList(res.data);
      } else {
        toast.error(res.error || "Error al cargar personal");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredStaff = staffList.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || staff.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const copyToClipboard = () => {
    if (formData.password) {
      navigator.clipboard.writeText(formData.password);
      toast.success("Contraseña copiada al portapapeles");
    }
  };

  const openNewStaff = () => {
    setEditingStaff(null);
    setFormData({
      name: "",
      email: "",
      role: "waiter",
      password: "",
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const openEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      password: "", // No mostramos el hash, se deja vacío para no cambiar
      isActive: staff.isActive
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);
      
      // Creamos el objeto de datos para enviar
      const { password, ...rest } = formData;
      const payload: any = { ...rest };
      
      // Solo incluimos la contraseña si se ha escrito algo
      if (password) {
        payload.password = password;
      }

      const res = await saveStaffAction(payload, editingStaff?.id);
      
      if (res.success) {
        toast.success(editingStaff ? "Personal actualizado" : "Personal creado");
        setIsDialogOpen(false);
        fetchData();
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este miembro del personal?")) return;

    try {
      const res = await deleteStaffAction(id);
      if (res.success) {
        toast.success("Eliminado correctamente");
        fetchData();
      } else {
        toast.error(res.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleToggleActive = async (staff: StaffMember) => {
    try {
      const res = await saveStaffAction({ isActive: !staff.isActive }, staff.id);
      if (res.success) {
        toast.success(staff.isActive ? "Usuario desactivado" : "Usuario activado");
        fetchData();
      } else {
        toast.error(res.error || "Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">Gestión de Personal</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Administra los roles, accesos y permisos de tu equipo.</p>
        </div>
        
        <Button className="w-full sm:w-auto shadow-sm" onClick={openNewStaff}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Empleado
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingStaff ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
            <DialogDescription>
              {editingStaff 
                ? "Actualiza la información del perfil y sus roles."
                : "Crea un nuevo perfil para tu personal. Define sus credenciales iniciales."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input 
                id="name" 
                placeholder="Ej. Juan Pérez" 
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol asignado</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val: Role) => setFormData(prev => ({ ...prev, role: val }))}
                disabled={editingStaff?.id === currentUser?.id}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (Acceso total)</SelectItem>
                  <SelectItem value="waiter">Mozo (Toma de pedidos, cobros)</SelectItem>
                  <SelectItem value="kitchen">Cocina (Visualización de comandas)</SelectItem>
                </SelectContent>
              </Select>
              {editingStaff?.id === currentUser?.id && (
                <p className="text-[10px] text-muted-foreground italic">No puedes cambiar tu propio rol.</p>
              )}
            </div>
            
            <div className="grid gap-2 mt-2">
              <Label htmlFor="password">{editingStaff ? "Nueva contraseña (opcional)" : "Contraseña temporal"}</Label>
              <div className="flex space-x-2">
                <Input 
                  id="password"
                  value={formData.password} 
                  onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={editingStaff ? "Dejar vacío para no cambiar" : "Generar una contraseña ->"}
                  className="font-mono bg-accent/50"
                  autoComplete="new-password"
                />
                <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generar contraseña aleatoria">
                  <Dices className="h-4 w-4" />
                </Button>
                {formData.password && (
                  <Button type="button" variant="outline" size="icon" onClick={copyToClipboard} title="Copiar al portapapeles">
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </form>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>Cancelar</Button>
            <Button onClick={handleSave} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingStaff ? "Guardar cambios" : "Guardar empleado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="admin">Admins</TabsTrigger>
            <TabsTrigger value="waiter">Mozos</TabsTrigger>
            <TabsTrigger value="kitchen">Cocina</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80 shadow-sm group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="search" 
            placeholder="Buscar por nombre o correo..." 
            className="pl-9 bg-background focus-visible:ring-primary/20" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Cargando personal...</p>
        </div>
      ) : filteredStaff.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStaff.map((staff) => {
            const isSelf = currentUser?.id === staff.id;
            
            return (
              <Card key={staff.id} className={`py-0 gap-2 overflow-hidden flex flex-col items-center text-center p-6 relative group transition-all duration-300 hover:shadow-lg hover:border-primary/20 ${!staff.isActive ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                <div className="absolute right-3 top-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100 transition-opacity">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer" onClick={() => openEditStaff(staff)}>
                        <UserPen className="mr-2 h-4 w-4" /> Editar perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => openEditStaff(staff)}>
                        <KeyRound className="mr-2 h-4 w-4" /> Cambiar contraseña
                      </DropdownMenuItem>
                      
                      {!isSelf && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className={`${staff.isActive ? 'text-orange-600' : 'text-green-600'} cursor-pointer`}
                            onClick={() => handleToggleActive(staff)}
                          >
                            {staff.isActive ? (
                              <><UserX className="mr-2 h-4 w-4" /> Desactivar cuenta</>
                            ) : (
                              <><Plus className="mr-2 h-4 w-4" /> Activar cuenta</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                            onClick={() => handleDelete(staff.id)}
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
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-muted/20 border-dashed mt-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserX className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No se encontraron empleados</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            No hay ningún miembro del personal que coincida con tu búsqueda. Intenta con otros términos o cambia el filtro de rol.
          </p>
          <Button variant="link" className="mt-2" onClick={() => { setSearchQuery(""); setActiveTab("all"); }}>
            Limpiar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
