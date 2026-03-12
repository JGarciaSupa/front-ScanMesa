"use client";

import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
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

import { Search, Plus, Pencil, Settings, ImagePlus, AlertCircle } from "lucide-react";

// Mocks Data
const MOCK_CATEGORIES = ["Todos", "Entradas", "Pizzas", "Bebidas", "Postres"];

const INITIAL_MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Pizza Margarita",
    description: "Salsa de tomate, mozzarella fresca y albahaca.",
    price: 12.5,
    category: "Pizzas",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800",
    available: true,
    outOfStock: false,
    hasInfiniteStock: true,
    stock: null,
  },
  {
    id: "2",
    name: "Tequeños (6 uds.)",
    description: "Deditos de queso envueltos en masa crujiente, acompañados de salsa de ajo.",
    price: 6.0,
    category: "Entradas",
    image: "https://images.unsplash.com/photo-1628197479717-36e6ba687eb1?auto=format&fit=crop&q=80&w=800",
    available: true,
    outOfStock: false,
    hasInfiniteStock: true,
    stock: null,
  },
  {
    id: "3",
    name: "Coca-Cola 330ml",
    description: "Refresco en lata super frío.",
    price: 2.5,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800",
    available: true,
    outOfStock: true,
    hasInfiniteStock: false,
    stock: 0,
  },
  {
    id: "4",
    name: "Tiramisú Casero",
    description: "El clásico postre italiano con mascarpone y café expreso.",
    price: 5.5,
    category: "Postres",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=800",
    available: false,
    outOfStock: false,
    hasInfiniteStock: false,
    stock: 5,
  },
  {
    id: "5",
    name: "Pizza Pepperoni",
    description: "Nuestra clásica pizza margarita con extra de pepperoni picante.",
    price: 14.0,
    category: "Pizzas",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800",
    available: true,
    outOfStock: false,
    hasInfiniteStock: true,
    stock: null,
  },
  {
    id: "6",
    name: "Cerveza Artesanal IPA",
    description: "Cerveza artesanal de la casa, notas cítricas y amargas.",
    price: 4.5,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1575037614876-c38db0cefa89?auto=format&fit=crop&q=80&w=800",
    available: true,
    outOfStock: false,
    hasInfiniteStock: false,
    stock: 24,
  },
];

export default function MenuManagementPage() {
  const [products, setProducts] = useState(INITIAL_MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Estados locales para el Formulario de Control de Stock del Drawer
  const [hasInfiniteStock, setHasInfiniteStock] = useState(true);
  const [stockValue, setStockValue] = useState<number | string>("");

  // Derived filtered state
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todos" || p.category === categoryFilter;
    let matchesStatus = true;
    if (statusFilter === "Activos") matchesStatus = p.available && !p.outOfStock;
    if (statusFilter === "Agotados") matchesStatus = p.outOfStock;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleToggleAvailable = (id: string, currentVal: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, available: !currentVal } : p))
    );
  };

  const openNewDish = () => {
    setEditingProduct(null);
    setHasInfiniteStock(true);
    setStockValue("");
    setIsSheetOpen(true);
  };

  const openEditDish = (product: typeof INITIAL_MOCK_PRODUCTS[0]) => {
    setEditingProduct(product);
    setHasInfiniteStock(product.hasInfiniteStock);
    setStockValue(product.stock !== null ? product.stock : "");
    setIsSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Menú</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/dashboard/categories">
              <Settings className="w-4 h-4 mr-2" />
              Gestionar Categorías
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
            placeholder="Buscar plato por nombre..."
            className="pl-9 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro de Categoría */}
        <div className="w-full md:w-[180px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat === "Todos" ? "Todas (Categorías)" : cat}
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
              <SelectItem value="Todos">Todos (Estado)</SelectItem>
              <SelectItem value="Activos">Activos / Disponibles</SelectItem>
              <SelectItem value="Agotados">Agotados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className={`overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col ${
              !product.available ? "opacity-60 saturate-50" : ""
            }`}
          >
            {/* Imagen del Plato */}
            <div className="relative aspect-video bg-muted w-full overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="shadow-sm backdrop-blur-md bg-background/80 text-foreground hover:bg-background/90 border-none">
                  {product.category}
                </Badge>
                {product.outOfStock && (
                  <Badge variant="destructive" className="shadow-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Fuera de stock
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
                  ${product.price.toFixed(2)}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                {product.description}
              </p>

              {/* Inventario Stats Rápido */}
               <div className="mb-4">
                  {!product.hasInfiniteStock && product.stock !== null && (
                    <span className="text-xs font-semibold px-2 py-1 bg-secondary rounded-md border text-secondary-foreground shadow-sm">
                      {product.stock} disponibles
                    </span>
                  )}
                  {product.hasInfiniteStock && (
                    <span className="text-xs text-muted-foreground italic flex items-center">
                    Stock infinito
                  </span>
                  )}
               </div>

              {/* Botoneria y Switches en el Footer de la Card */}
              <div className="flex items-center justify-between pt-4 mt-auto border-t">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`available-${product.id}`}
                    checked={product.available}
                    onCheckedChange={() => handleToggleAvailable(product.id, product.available)}
                  />
                  <Label
                    htmlFor={`available-${product.id}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    Disponible
                  </Label>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => openEditDish(product)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 bg-muted/20 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No se encontraron productos con estos filtros.</p>
          <Button variant="link" onClick={() => { setSearchTerm(""); setCategoryFilter("Todos"); setStatusFilter("Todos"); }}>Limpiar filtros</Button>
        </div>
      )}

      {/* Slide / Sheet para Crear/Editar Plato */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="flex flex-col w-full sm:max-w-xl p-0 gap-0">
          <div className="p-6 border-b">
            <SheetHeader>
              <SheetTitle className="text-2xl font-semibold">
                {editingProduct ? "Editar Plato" : "Añadir Nuevo Plato"}
              </SheetTitle>
              <SheetDescription>
                Completa los detalles del platillo para agregarlo al menú digital.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            
            {/* Upload Area */}
            <div className="grid gap-3">
              <Label className="text-base font-medium">Imagen del Plato</Label>
              <div className="border-2 border-dashed rounded-xl overflow-hidden relative group bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col items-center justify-center text-center cursor-pointer min-h-[220px]">
                {editingProduct ? (
                  <>
                    <img src={editingProduct.image} alt="Preview" className="object-cover w-full h-full absolute inset-0" />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <ImagePlus className="w-8 h-8 text-white mb-2" />
                      <p className="text-white text-sm font-medium">Cambiar Imagen</p>
                    </div>
                  </>
                ) : (
                  <div className="py-8">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                      <ImagePlus className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-semibold mb-1">Haz clic para subir imagen</p>
                    <p className="text-xs text-muted-foreground px-4">Soporta JPG, PNG o WEBP. Tamaño máximo 2MB.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="dish-name" className="text-sm font-medium">Nombre del Plato</Label>
              <Input
                id="dish-name"
                defaultValue={editingProduct?.name || ""}
                placeholder="Ej. Pizza de Pepperoni"
                className="h-11"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="grid gap-3">
                <Label htmlFor="price" className="text-sm font-medium">Precio ($)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct?.price || ""}
                    placeholder="0.00"
                    className="pl-8 h-11"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <Label className="text-sm font-medium">Categoría</Label>
                <Select defaultValue={editingProduct?.category || ""}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CATEGORIES.filter(c => c !== "Todos").map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Breve descripción de los ingredientes..."
                className="resize-none min-h-[100px]"
                defaultValue={editingProduct?.description || ""}
              />
            </div>

            {/* SECCIÓN DE INVENTARIO Y DISPONIBILIDAD O STOCK */}
            <div className="flex flex-col gap-4 p-4 bg-muted/40 rounded-xl border border-muted mt-2">
              <h4 className="font-semibold text-sm">Inventario y Visibilidad</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Gestión de Stock</Label>
                    <Tabs
                      value={hasInfiniteStock ? "infinite" : "limited"}
                      onValueChange={(val) => {
                        setHasInfiniteStock(val === "infinite");
                        if (val === "infinite") setStockValue("");
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="infinite">Ilimitado</TabsTrigger>
                        <TabsTrigger value="limited">Específico</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {!hasInfiniteStock && (
                    <div className="grid gap-2 pt-1 animate-in fade-in slide-in-from-top-1">
                      <Label htmlFor="stock-qty" className="text-xs text-muted-foreground">Cantidad disponible</Label>
                      <Input
                        id="stock-qty"
                        type="number"
                        placeholder="Ej. 10"
                        className="h-10 bg-background"
                        value={stockValue}
                        onChange={(e) => setStockValue(e.target.value)}
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
                        Desactiva para ocultarlo.
                      </p>
                    </div>
                    <Switch id="edit-available" defaultChecked={editingProduct ? editingProduct.available : true} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-muted/10">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <SheetClose asChild>
                <Button variant="outline" className="w-full sm:w-auto h-11">Cancelar</Button>
              </SheetClose>
              <Button className="w-full sm:w-auto h-11">
                {editingProduct ? "Guardar Cambios" : "Crear Plato"}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
