"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { GripVertical } from "lucide-react";

// Import custom components from the shared dashboard components directory
import { CategoryHeader } from "@/components/dashboard/categories/category-header";
import { CategorySearch } from "@/components/dashboard/categories/category-search";
import { CategoryTable } from "@/components/dashboard/categories/category-table";
import { CategorySheet } from "@/components/dashboard/categories/category-sheet";
import { CategoryDeleteModal } from "@/components/dashboard/categories/category-delete-modal";

import {
  getCategoriesAction,
  saveCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
  reorderCategoriesAction,
} from "@/app/actions/categories";

interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete modal states
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategoriesAction();
      if (data.success) {
        setCategories(data.data);
      } else {
        toast.error(data.error || "Error al cargar categorías");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleToggleActive = async (id: number, currentState: boolean) => {
    try {
      const data = await toggleCategoryActiveAction(id, !currentState);
      if (data.success) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === id ? { ...cat, isActive: !currentState } : cat,
          ),
        );
        toast.success("Estado actualizado");
      } else {
        toast.error(data.error || "Error al actualizar estado");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const openNewCategory = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", isActive: true });
    setIsSheetOpen(true);
  };

  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setIsSheetOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre es requerido");
      return;
    }

    try {
      setSubmitting(true);
      const data = await saveCategoryAction(formData, editingCategory?.id);

      if (data.success) {
        toast.success(
          editingCategory ? "Categoría actualizada" : "Categoría creada",
        );
        setIsSheetOpen(false);
        fetchCategories();
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setSubmitting(true);
      const data = await deleteCategoryAction(categoryToDelete.id);
      if (data.success) {
        setCategories((prev) =>
          prev.filter((cat) => cat.id !== categoryToDelete.id),
        );
        toast.success("Categoría y sus productos eliminados correctamente");
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSubmitting(false);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setCategories(items);

    try {
      const orderedIds = items.map((cat) => cat.id);
      const data = await reorderCategoriesAction(orderedIds);
      if (data.success) {
        toast.success("Orden actualizado correctamente");
      } else {
        toast.error("Error al guardar el nuevo orden");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Error de conexión al reordenar");
      fetchCategories();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Componente que muestra el título de la página y el botón para crear una nueva categoría */}
      <CategoryHeader onNewCategory={openNewCategory} />

      {/* Componente de búsqueda para filtrar las categorías por nombre */}
      <CategorySearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Componente que renderiza la tabla de categorías con soporte para reordenamiento (drag and drop) */}
      <CategoryTable
        categories={filteredCategories}
        loading={loading}
        searchTerm={searchTerm}
        onToggleActive={handleToggleActive}
        onEdit={openEditCategory}
        onDelete={openDeleteModal}
        onDragEnd={onDragEnd}
      />

      <p className="text-xs text-muted-foreground text-center sm:text-left flex items-center justify-center sm:justify-start">
        <GripVertical className="w-3 h-3 mr-1 opacity-60" />{" "}
        {!!searchTerm
          ? "Desactiva la búsqueda para poder reordenar."
          : "Usa el ícono de arrastre para reordenar las categorías. El menú de tus clientes reflejará este orden inmediatamente."}
      </p>

      {/* Panel lateral (Sheet) para crear o editar los detalles de una categoría */}
      <CategorySheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        editingCategory={editingCategory}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSave}
        submitting={submitting}
      />

      {/* Modal de confirmación para eliminar una categoría y todos sus productos asociados */}
      <CategoryDeleteModal
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        category={categoryToDelete}
        onConfirm={confirmDelete}
        submitting={submitting}
      />
    </div>
  );
}
