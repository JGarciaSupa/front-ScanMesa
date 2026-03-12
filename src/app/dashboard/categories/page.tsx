"use client";

import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  GripVertical
} from "lucide-react";

// Mock Data de Categorías
const INITIAL_CATEGORIES = [
  { id: "1", name: "Entradas", description: "Aperitivos para empezar", count: 12, active: true },
  { id: "2", name: "Pizzas", description: "Nuestras pizzas de masa madre", count: 8, active: true },
  { id: "3", name: "Bebidas", description: "Refrescos, cervezas y vinos", count: 24, active: true },
  { id: "4", name: "Postres", description: "El toque dulce final", count: 5, active: false },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Filter
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (id: string, currentState: boolean) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, active: !currentState } : cat
      )
    );
  };

  const openNewCategory = () => {
    setEditingCategory(null);
    setIsSheetOpen(true);
  };

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Back Button & Header */}
      <div>
        <Link href="/dashboard/menu" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Volver al Menú
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
            <p className="text-muted-foreground mt-1">
              Organiza cómo se muestran los productos en el menú de tus clientes.
            </p>
          </div>
          <Button onClick={openNewCategory} className="w-full sm:w-auto shrink-0 shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
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
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-12 text-center"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden md:table-cell">Descripción</TableHead>
              <TableHead className="text-center">Platos</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TableRow key={category.id} className="group hover:bg-muted/20 transition-colors">
                  <TableCell className="text-center p-0 align-middle">
                    <Button variant="ghost" size="icon" className="cursor-grab text-muted-foreground/50 group-hover:text-muted-foreground active:cursor-grabbing w-8 h-8 rounded-md">
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {category.name}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground max-w-[200px] truncate">
                    {category.description || <span className="italic text-muted-foreground/50">Sin descripción</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center bg-secondary text-secondary-foreground font-semibold px-2.5 py-0.5 rounded-full text-xs min-w-[32px]">
                      {category.count}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Switch
                        checked={category.active}
                        onCheckedChange={() => handleToggleActive(category.id, category.active)}
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
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No se encontraron categorías que coincidan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-center sm:text-left flex items-center justify-center sm:justify-start">
        <GripVertical className="w-3 h-3 mr-1 opacity-60" /> Usa el ícono de arrastre para reordenar las categorías. El menú de tus clientes reflejará este orden inmediatamente.
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
              <Label htmlFor="cat-name" className="text-sm font-medium">Nombre de la Categoría <span className="text-destructive">*</span></Label>
              <Input
                id="cat-name"
                defaultValue={editingCategory?.name || ""}
                placeholder="Ej. Bebidas Calientes"
                className="h-11 bg-background"
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cat-desc" className="text-sm font-medium">Descripción (Opcional)</Label>
              <Textarea
                id="cat-desc"
                placeholder="Ej. Nuestra selección de tés e infusiones artesanales."
                className="resize-none min-h-[90px] bg-background"
                defaultValue={editingCategory?.description || ""}
              />
            </div>

            <div className="bg-background p-5 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base font-semibold" htmlFor="cat-active">
                    Visibilidad en Menú
                  </Label>
                  <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                    Si desactivas esta opción, todos los platillos dentro de esta categoría quedarán ocultos temporalmente.
                  </p>
                </div>
                <Switch id="cat-active" defaultChecked={editingCategory ? editingCategory.active : true} />
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-background">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <SheetClose asChild>
                <Button variant="outline" className="w-full sm:w-auto h-11">Cancelar</Button>
              </SheetClose>
              <Button className="w-full sm:w-auto h-11">
                {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
