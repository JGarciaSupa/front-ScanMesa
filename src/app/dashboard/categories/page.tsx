"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  GripVertical,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  count?: number; // Added for UI compatibility, though not in schema yet
}

import {
  getCategoriesAction,
  saveCategoryAction,
  deleteCategoryAction,
  toggleCategoryActiveAction,
  reorderCategoriesAction,
} from "@/app/actions/categories";

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
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Back Button & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-1">
            Organiza cómo se muestran los productos en el menú de tus clientes.
          </p>
        </div>
        <Button
          onClick={openNewCategory}
          className="w-full sm:w-auto shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Toolbar / Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/20 p-4 rounded-xl border border-muted/50">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar categoría por nombre..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-background border rounded-xl overflow-hidden shadow-sm">
        <DragDropContext onDragEnd={onDragEnd}>
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12 text-center"></TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="hidden md:table-cell">
                  Descripción
                </TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId="categories">
              {(provided) => (
                <TableBody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={loading ? "opacity-50 pointer-events-none" : ""}
                >
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-muted-foreground">
                            Cargando categorías...
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((category, index) => (
                      <Draggable
                        key={category.id}
                        draggableId={category.id.toString()}
                        index={index}
                        isDragDisabled={!!searchTerm}
                      >
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`group hover:bg-muted/20 transition-colors ${snapshot.isDragging ? "bg-muted shadow-lg ring-1 ring-primary/20 z-50 display-table" : ""}`}
                            style={{
                              ...provided.draggableProps.style,
                              display: snapshot.isDragging
                                ? "table"
                                : "table-row",
                            }}
                          >
                            <TableCell className="text-center p-0 align-middle">
                              <div
                                {...provided.dragHandleProps}
                                className={`flex items-center justify-center p-2 text-muted-foreground/50 group-hover:text-muted-foreground active:cursor-grabbing rounded-md ${!!searchTerm ? "cursor-not-allowed opacity-30" : "cursor-grab"}`}
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium whitespace-nowrap">
                              {category.name}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                              {category.description || (
                                <span className="italic text-muted-foreground/50">
                                  Sin descripción
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex justify-center">
                                <Switch
                                  checked={category.isActive}
                                  onCheckedChange={() =>
                                    handleToggleActive(
                                      category.id,
                                      category.isActive,
                                    )
                                  }
                                  className="scale-90"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors hover:bg-muted"
                                  onClick={() => openEditCategory(category)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors hover:bg-destructive/10"
                                  onClick={() => openDeleteModal(category)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No se encontraron categorías.
                      </TableCell>
                    </TableRow>
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </div>

      <p className="text-xs text-muted-foreground text-center sm:text-left flex items-center justify-center sm:justify-start">
        <GripVertical className="w-3 h-3 mr-1 opacity-60" />{" "}
        {!!searchTerm
          ? "Desactiva la búsqueda para poder reordenar."
          : "Usa el ícono de arrastre para reordenar las categorías. El menú de tus clientes reflejará este orden inmediatamente."}
      </p>

      {/* Editor Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-md p-0 gap-0 border-l shadow-2xl">
          <div className="p-6 border-b bg-background z-10">
            <SheetHeader>
              <SheetTitle className="text-2xl">
                {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
              </SheetTitle>
              <SheetDescription>
                {editingCategory
                  ? "Actualiza la información de esta sección de tu menú."
                  : "Crea una agrupación nueva para clasificar tus platillos."}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-muted/10">
            <div className="grid gap-2">
              <Label htmlFor="cat-name" className="text-sm font-medium">
                Nombre de la Categoría{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cat-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej. Bebidas Calientes"
                className="h-11 bg-background"
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="cat-desc" className="text-sm font-medium">
                Descripción (Opcional)
              </Label>
              <Textarea
                id="cat-desc"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ej. Nuestra selección de tés e infusiones artesanales."
                className="resize-none min-h-[90px] bg-background"
              />
            </div>

            <div className="bg-background p-5 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label
                    className="text-base font-semibold"
                    htmlFor="cat-active"
                  >
                    Visibilidad en Menú
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                    Si desactivas esta opción, todos los platillos dentro de
                    esta categoría quedarán ocultos temporalmente.
                  </p>
                </div>
                <Switch
                  id="cat-active"
                  checked={formData.isActive}
                  onCheckedChange={(val) =>
                    setFormData({ ...formData, isActive: val })
                  }
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-background">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </SheetClose>
              <Button
                className="w-full sm:w-auto h-11"
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Modal */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              ¿Eliminar categoría?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Esta acción es{" "}
              <span className="font-bold text-foreground">irreversible</span>.
              Se eliminarán permanentemente la categoría{" "}
              <span className="font-semibold text-foreground">
                "{categoryToDelete?.name}"
              </span>
              , todos los productos asociados a ella y sus imágenes almacenadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel
              className="w-full sm:w-auto mt-0"
              disabled={submitting}
            >
              Cancelar
            </AlertDialogCancel>
            <Button
              variant="destructive"
              className="w-full sm:w-auto h-10"
              onClick={confirmDelete}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar Todo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
