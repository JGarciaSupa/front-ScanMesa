"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Plus, 
  Settings, 
  Loader2 
} from "lucide-react";

import { 
  getProductsAction, 
  saveProductAction, 
  deleteProductAction, 
  toggleProductAvailableAction 
} from "@/app/actions/products";
import { getCategoriesAction } from "@/app/actions/categories";

import { Product, Category } from "@/components/dashboard/menu/types";
import { ProductCard } from "@/components/dashboard/menu/ProductCard";
import { ProductFilters } from "@/components/dashboard/menu/ProductFilters";
import { ProductEditorSheet } from "@/components/dashboard/menu/ProductEditorSheet";

export default function MenuManagementPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        getProductsAction(),
        getCategoriesAction()
      ]);

      if (productsRes.success) {
        setProducts(productsRes.data);
      } else {
        toast.error(productsRes.error || "Error al cargar productos");
      }
      
      if (categoriesRes.success) {
        setCategories(categoriesRes.data);
      } else {
        toast.error(categoriesRes.error || "Error al cargar categorías");
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

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todos" || p.categoryName === categoryFilter;
    let matchesStatus = true;
    if (statusFilter === "Activos") matchesStatus = p.isAvailable && (!p.trackStock || p.currentStock > 0);
    if (statusFilter === "Agotados") matchesStatus = p.trackStock && p.currentStock <= 0;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleAvailable = async (id: number, currentVal: boolean) => {
    try {
      const data = await toggleProductAvailableAction(id, !currentVal);
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isAvailable: !currentVal } : p))
        );
        toast.success("Estado actualizado");
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const openNewDish = () => {
    setEditingProduct(null);
    setIsSheetOpen(true);
  };

  const openEditDish = (p: Product) => {
    setEditingProduct(p);
    setIsSheetOpen(true);
  };

  const handleSave = async (formData: FormData) => {
    try {
      setSubmitting(true);
      const data = await saveProductAction(formData, editingProduct?.id);
      
      if (data.success) {
        toast.success(editingProduct ? "Producto actualizado" : "Producto creado");
        setIsSheetOpen(false);
        fetchData();
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Error de conexión al servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      const data = await deleteProductAction(id);
      if (data.success) {
        toast.success("Producto eliminado");
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Menú</h1>
          <p className="text-muted-foreground mt-1">
            Administra los platos, precios y disponibilidad de tu menú digital.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/dashboard/categories">
              <Settings className="w-4 h-4 mr-2" />
              Categorías
            </Link>
          </Button>
          <Button onClick={openNewDish} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Plato
          </Button>
        </div>
      </div>

      {/* Toolbar / Filtros */}
      <ProductFilters 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        categories={categories}
      />

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              onToggleAvailable={handleToggleAvailable}
              onEdit={openEditDish}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No se encontraron productos.</p>
          <Button variant="link" onClick={() => { setSearchTerm(""); setCategoryFilter("Todos"); setStatusFilter("Todos"); }}>Limpiar filtros</Button>
        </div>
      )}

      {/* Editor Sheet */}
      <ProductEditorSheet 
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        product={editingProduct}
        categories={categories}
        onSave={handleSave}
        isSubmitting={submitting}
      />
    </div>
  );
}
