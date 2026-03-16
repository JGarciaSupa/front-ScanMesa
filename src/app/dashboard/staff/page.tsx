"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import {
  getStaffAction,
  saveStaffAction,
  deleteStaffAction,
} from "@/app/actions/staff";
import { useAuthStore } from "@/store/useAuthStore";

// Components
import { StaffHeader } from "./components/StaffHeader";
import { StaffFilters } from "./components/StaffFilters";
import { StaffGrid } from "./components/StaffGrid";
import { StaffDialog } from "./components/StaffDialog";

// Types
import { Role, StaffMember } from "./types";

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
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: Role;
    password?: string;
    isActive: boolean;
  }>({
    name: "",
    email: "",
    role: "waiter",
    password: "",
    isActive: true,
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
    const matchesSearch =
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || staff.role === activeTab;
    return matchesSearch && matchesTab;
  });

  const generatePassword = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password }));
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
      isActive: true,
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
      isActive: staff.isActive,
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

      const { password, ...rest } = formData;
      const payload: any = { ...rest };

      if (password) {
        payload.password = password;
      }

      const res = await saveStaffAction(payload, editingStaff?.id);

      if (res.success) {
        toast.success(
          editingStaff ? "Personal actualizado" : "Personal creado",
        );
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
    if (!confirm("¿Estás seguro de eliminar este miembro del personal?"))
      return;

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
      const res = await saveStaffAction(
        { isActive: !staff.isActive },
        staff.id,
      );
      if (res.success) {
        toast.success(
          staff.isActive ? "Usuario desactivado" : "Usuario activado",
        );
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
      {/* Componente que muestra el título de la página y el botón para agregar nuevo personal */}
      <StaffHeader onAddStaff={openNewStaff} />

      {/* Modal para crear o editar la información de un miembro del equipo */}
      <StaffDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingStaff={editingStaff}
        currentUser={currentUser}
        formData={formData}
        onFormChange={setFormData}
        onSave={handleSave}
        onGeneratePassword={generatePassword}
        onCopyToClipboard={copyToClipboard}
        submitting={submitting}
      />

      {/* Controles para filtrar por rol y buscador por nombre o correo electrónico */}
      <StaffFilters
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Cuadrícula que renderiza las tarjetas de cada empleado o estados de carga/vacío */}
      <StaffGrid
        loading={loading}
        staffMembers={filteredStaff}
        currentUser={currentUser}
        onEditProfile={openEditStaff}
        onChangePassword={openEditStaff}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        onClearFilters={() => {
          setSearchQuery("");
          setActiveTab("all");
        }}
      />
    </div>
  );
}
