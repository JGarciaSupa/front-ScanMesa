"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import { 
  Search, 
  Plus, 
  Pencil, 
  Settings, 
  ImagePlus, 
  AlertCircle, 
  Loader2, 
  Trash2,
  Image as ImageIcon,
  Upload
} from "lucide-react";

import { 
  getProductsAction, 
  saveProductAction, 
  deleteProductAction, 
  toggleProductAvailableAction 
} from "@/app/actions/products";
import { getCategoriesAction } from "@/app/actions/categories";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: number;
  categoryName: string | null;
  isAvailable: boolean;
  trackStock: boolean;
  currentStock: number;
}

interface Category {
  id: number;
  name: string;
}

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

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isAvailable: true,
    trackStock: false,
    currentStock: "0"
  });

  // Image states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: categories.length > 0 ? categories[0].id.toString() : "",
      isAvailable: true,
      trackStock: false,
      currentStock: "0"
    });
    setSelectedImage(null);
    setPreviewUrl(null);
    setIsSheetOpen(true);
  };

  const openEditDish = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      description: p.description || "",
      price: p.price.toString(),
      categoryId: p.categoryId.toString(),
      isAvailable: p.isAvailable,
      trackStock: p.trackStock,
      currentStock: p.currentStock.toString()
    });
    setSelectedImage(null);
    setPreviewUrl(p.imageUrl);
    setIsSheetOpen(true);
  };

  const validateAndSetImage = (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen (JPG, PNG, WEBP)");
      return;
    }
    
    // Validar tamaño (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 2MB");
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 1) {
      toast.error("Solo puedes subir una imagen a la vez");
      return;
    }
    
    if (files[0]) {
      validateAndSetImage(files[0]);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("categoryId", formData.categoryId);
      form.append("isAvailable", formData.isAvailable.toString());
      form.append("trackStock", formData.trackStock.toString());
      form.append("currentStock", formData.currentStock);
      
      if (selectedImage) {
        form.append("image", selectedImage);
      }

      const data = await saveProductAction(form, editingProduct?.id);
      
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar plato..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro de Categoría */}
        <div className="w-full md:w-[200px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas las categorías</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Estado */}
        <div className="w-full md:w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              <SelectItem value="Activos">Disponibles</SelectItem>
              <SelectItem value="Agotados">Sin Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando productos...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className={`py-0 gap-0 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col ${
                !product.isAvailable ? "opacity-60 saturate-50" : ""
              }`}
            >
              {/* Imagen del Plato */}
              <div className="relative aspect-video bg-muted w-full overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="shadow-sm backdrop-blur-md bg-background/80 text-foreground hover:bg-background/90 border-none">
                    {product.categoryName || "Sin Categoría"}
                  </Badge>
                  {product.trackStock && product.currentStock <= 0 && (
                    <Badge variant="destructive" className="shadow-sm flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Agotado
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-semibold text-lg leading-tight line-clamp-2">
                    {product.name}
                  </h3>
                  <span className="font-bold text-lg text-primary whitespace-nowrap">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {product.description || "Sin descripción."}
                </p>

                {/* Stock Info */}
                <div className="mb-4">
                  {product.trackStock ? (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md border shadow-sm ${
                      product.currentStock > 0 ? "bg-secondary text-secondary-foreground" : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {product.currentStock} unidades
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Stock ilimitado
                    </span>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 mt-auto border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`available-${product.id}`}
                      checked={product.isAvailable}
                      onCheckedChange={() => handleToggleAvailable(product.id, product.isAvailable)}
                    />
                    <Label
                      htmlFor={`available-${product.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {product.isAvailable ? "Disponible" : "Oculto"}
                    </Label>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => openEditDish(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No se encontraron productos.</p>
          <Button variant="link" onClick={() => { setSearchTerm(""); setCategoryFilter("Todos"); setStatusFilter("Todos"); }}>Limpiar filtros</Button>
        </div>
      )}

      {/* Editor Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-xl p-0 gap-0">
          <div className="p-6 border-b">
            <SheetHeader>
              <SheetTitle className="text-2xl font-semibold">
                {editingProduct ? "Editar Plato" : "Nuevo Plato"}
              </SheetTitle>
              <SheetDescription>
                {editingProduct 
                  ? "Actualiza la información de este platillo."
                  : "Crea un nuevo platillo para tu menú digital."}
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* Image Upload Area */}
            <div className="grid gap-3">
              <Label className="text-base font-medium">Imagen del Plato</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl overflow-hidden relative group transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px] ${
                  isDragging 
                    ? "border-primary bg-primary/10" 
                    : "border-muted-foreground/20 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
                
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="object-cover w-full h-full absolute inset-0" />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <ImagePlus className="w-8 h-8 text-white mb-2" />
                      <p className="text-white text-sm font-medium">Cambiar Imagen</p>
                    </div>
                  </>
                ) : (
                  <div className="py-8 px-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                      isDragging ? "bg-primary text-white" : "bg-primary/10 text-primary"
                    }`}>
                      {isDragging ? <Upload className="w-7 h-7 animate-bounce" /> : <ImagePlus className="w-7 h-7" />}
                    </div>
                    <p className="text-sm font-semibold mb-1">
                      {isDragging ? "¡Suéltala ahora!" : "Suelta una imagen aquí o haz clic"}
                    </p>
                    <p className="text-xs text-muted-foreground">Webp, JPG o PNG hasta 2MB (Máx. 1 archivo)</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="dish-name" className="text-sm font-medium">Nombre del Plato <span className="text-destructive">*</span></Label>
              <Input
                id="dish-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Pizza de Pepperoni"
                className="h-11"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="grid gap-3">
                <Label htmlFor="price" className="text-sm font-medium">Precio ($) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="pl-8 h-11"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium">Categoría <span className="text-destructive">*</span></Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(val) => setFormData({ ...formData, categoryId: val })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description" className="text-sm font-medium">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descripción de los ingredientes..."
                className="resize-none min-h-[100px]"
              />
            </div>

            {/* Inventario Stats */}
            <div className="flex flex-col gap-4 p-4 bg-muted/40 rounded-xl border border-muted mt-2">
              <h4 className="font-semibold text-sm">Inventario y Visibilidad</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gestión de Stock</Label>
                    <Tabs
                      value={formData.trackStock ? "limited" : "infinite"}
                      onValueChange={(val) => {
                        setFormData({ ...formData, trackStock: val === "limited" });
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="infinite">Ilimitado</TabsTrigger>
                        <TabsTrigger value="limited">Específico</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {formData.trackStock && (
                    <div className="grid gap-2 pt-1 animate-in fade-in slide-in-from-top-1">
                      <Label htmlFor="stock-qty" className="text-xs text-muted-foreground">Cantidad disponible</Label>
                      <Input
                        id="stock-qty"
                        type="number"
                        placeholder="Ej. 10"
                        className="h-10 bg-background"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <div className="pt-4 sm:pt-0 sm:pl-4 sm:border-l flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 pr-2">
                      <Label className="text-sm font-medium" htmlFor="edit-available">
                        Activo en Menú
                      </Label>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Desactiva para ocultarlo del cliente.
                      </p>
                    </div>
                    <Switch 
                      id="edit-available" 
                      checked={formData.isAvailable} 
                      onCheckedChange={(val) => setFormData({ ...formData, isAvailable: val })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-muted/10">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <SheetClose asChild>
                <Button variant="outline" className="w-full sm:w-auto h-11" disabled={submitting}>Cancelar</Button>
              </SheetClose>
              <Button className="w-full sm:w-auto h-11" onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingProduct ? "Guardar Cambios" : "Crear Plato"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
