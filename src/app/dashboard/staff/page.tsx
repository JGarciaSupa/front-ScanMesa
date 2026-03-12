"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  UserPen, 
  KeyRound, 
  UserX, 
  Dices,
  Copy
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

type Role = "admin" | "waiter" | "kitchen";
type Status = "online" | "offline";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  avatarUrl?: string;
}

const mockStaff: StaffMember[] = [
  { id: "1", name: "Renato Torres", email: "renato@manager.com", role: "admin", status: "online" },
  { id: "2", name: "Carlos Perez", email: "carlos@waiter.com", role: "waiter", status: "offline" },
  { id: "3", name: "Ana Gomez", email: "ana@kitchen.com", role: "kitchen", status: "online" },
  { id: "4", name: "Maria Garcia", email: "maria@waiter.com", role: "waiter", status: "online" },
  { id: "5", name: "Luis Fernandez", email: "luis@admin.com", role: "admin", status: "offline" },
];

const mockLogs = [
  { id: "l1", user: "Ana Gomez", action: "Inicio de sesión", time: "Hace 5 minutos" },
  { id: "l2", user: "Renato Torres", action: "Cierre de sesión", time: "Hace 2 horas" },
  { id: "l3", user: "Carlos Perez", action: "Inicio de sesión", time: "Hace 4 horas" },
  { id: "l4", user: "Maria Garcia", action: "Inicio de sesión", time: "Hace 5 horas" },
];

const roleConfig: Record<Role, { label: string, color: string }> = {
  admin: { label: "Admin", color: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
  waiter: { label: "Mozo", color: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" },
  kitchen: { label: "Cocina", color: "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800" },
};

export default function StaffManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [newPassword, setNewPassword] = useState("");

  const filteredStaff = mockStaff.filter((staff) => {
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
    setNewPassword(password);
  };

  const copyToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Personal</h2>
          <p className="text-muted-foreground mt-1">Administra los roles, accesos y permisos de tu equipo.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Agregar Empleado
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nuevo Empleado</DialogTitle>
              <DialogDescription>
                Crea un nuevo perfil para tu personal. Recibirán las credenciales en su primer ingreso.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" placeholder="Ej. Juan Pérez" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="juan@ejemplo.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rol asignado</Label>
                <Select>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador (Acceso total)</SelectItem>
                    <SelectItem value="waiter">Mozo (Toma de pedidos, cobros)</SelectItem>
                    <SelectItem value="kitchen">Cocina (Visualización de comandas)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2 mt-2">
                <Label>Contraseña temporal</Label>
                <div className="flex space-x-2">
                  <Input 
                    value={newPassword} 
                    readOnly 
                    placeholder="Genera una contraseña ->"
                    className="font-mono bg-accent/50"
                  />
                  <Button type="button" variant="outline" size="icon" onClick={generatePassword} title="Generar contraseña aleatoria">
                    <Dices className="h-4 w-4" />
                  </Button>
                  {newPassword && (
                    <Button type="button" variant="outline" size="icon" onClick={copyToClipboard} title="Copiar al portapapeles">
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Guardar empleado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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

        <div className="relative w-full md:w-80 shadow-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Buscar por nombre o correo..." 
            className="pl-9 bg-background" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Staff Grid */}
      {filteredStaff.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-2">
          {filteredStaff.map((staff) => (
            <Card key={staff.id} className="overflow-hidden flex flex-col items-center text-center p-6 relative group transition-all hover:shadow-md hover:border-primary/20">
              <div className="absolute right-3 top-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-50 group-hover:opacity-100 transition-opacity">
                      <span className="sr-only">Abrir menú</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="cursor-pointer">
                      <UserPen className="mr-2 h-4 w-4" /> Editar permisos
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <KeyRound className="mr-2 h-4 w-4" /> Cambiar contraseña
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer">
                      <UserX className="mr-2 h-4 w-4" /> Dar de baja
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="relative mb-5 mt-2">
                <Avatar className="h-20 w-20 border shadow-sm">
                  <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                  <AvatarFallback className="text-xl bg-primary/5 font-semibold text-primary">{getInitials(staff.name)}</AvatarFallback>
                </Avatar>
                <div 
                  className={`absolute bottom-0 right-1 h-4 w-4 rounded-full border-2 border-background shadow-sm ${staff.status === "online" ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"}`}
                  title={staff.status === "online" ? "En línea" : "Fuera de turno"}
                />
              </div>

              <div className="w-full flex-1 flex flex-col items-center">
                <h3 className="font-semibold text-lg truncate w-full" title={staff.name}>{staff.name}</h3>
                <p className="text-sm text-muted-foreground truncate w-full mb-3" title={staff.email}>{staff.email}</p>
                <div className="mt-auto pt-1 pb-2">
                  <Badge variant="outline" className={`font-medium border shadow-sm ${roleConfig[staff.role].color}`}>
                    {roleConfig[staff.role].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-center space-x-1.5 mt-2">
                  <div className={`h-1.5 w-1.5 rounded-full ${staff.status === "online" ? "bg-green-500" : "bg-muted-foreground"}`} />
                  <p className={`text-xs font-medium ${staff.status === "online" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}>
                    {staff.status === "online" ? "En turno ahora" : "Fuera de turno"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
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
        </div>
      )}

      {/* Logs Table Section */}
      <div className="mt-12 pt-4">
        <h3 className="text-xl font-semibold mb-4 tracking-tight">Logs de actividad recientes</h3>
        <Card className="overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-medium">Usuario</th>
                  <th scope="col" className="px-6 py-3.5 font-medium">Acción</th>
                  <th scope="col" className="px-6 py-3.5 font-medium text-right">Tiempo</th>
                </tr>
              </thead>
              <tbody>
                {mockLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {getInitials(log.user)}
                      </div>
                      {log.user}
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground">
                      <span className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/10">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground text-right">{log.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
