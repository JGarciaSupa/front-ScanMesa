"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Category, Product } from "./types";

interface ProductEditorSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  categories: Category[];
  onSave: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function ProductEditorSheet({
  isOpen,
  onOpenChange,
  product,
  categories,
  onSave,
  isSubmitting,
}: ProductEditorSheetProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    isAvailable: true,
    trackStock: false,
    currentStock: "0",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        categoryId: product.categoryId.toString(),
        isAvailable: product.isAvailable,
        trackStock: product.trackStock,
        currentStock: product.currentStock.toString(),
      });
      setPreviewUrl(product.imageUrl);
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        categoryId: categories.length > 0 ? categories[0].id.toString() : "",
        isAvailable: true,
        trackStock: false,
        currentStock: "0",
      });
      setPreviewUrl(null);
    }
    setSelectedImage(null);
  }, [product, categories, isOpen]);

  const validateAndSetImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen (JPG, PNG, WEBP)");
      return;
    }

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

  const handleLocalSave = async () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }

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

    await onSave(form);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-xl p-0 gap-0">
        <div className="p-6 border-b">
          <SheetHeader className="p-0">
            <SheetTitle className="text-2xl font-semibold">
              {product ? "Editar Plato" : "Nuevo Plato"}
            </SheetTitle>
            <SheetDescription>
              {product
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
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="object-cover w-full h-full absolute inset-0"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <ImagePlus className="w-8 h-8 text-white mb-2" />
                    <p className="text-white text-sm font-medium">
                      Cambiar Imagen
                    </p>
                  </div>
                </>
              ) : (
                <div className="py-8 px-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
                      isDragging
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {isDragging ? (
                      <Upload className="w-7 h-7 animate-bounce" />
                    ) : (
                      <ImagePlus className="w-7 h-7" />
                    )}
                  </div>
                  <p className="text-sm font-semibold mb-1">
                    {isDragging
                      ? "¡Suéltala ahora!"
                      : "Suelta una imagen aquí o haz clic"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Webp, JPG o PNG hasta 2MB (Máx. 1 archivo)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="dish-name" className="text-sm font-medium">
              Nombre del Plato <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dish-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej. Pizza de Pepperoni"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="grid gap-3">
              <Label htmlFor="price" className="text-sm font-medium">
                Precio<span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="price"
                  type="text"
                  inputMode="decimal"
                  value={formData.price.replace(".", ",")}
                  onChange={(e) => {
                    const val = e.target.value.replace(",", ".");
                    if (val === "" || /^\d+(\.\d{0,2})?$/.test(val)) {
                      setFormData({ ...formData, price: val });
                    }
                  }}
                  placeholder="0,00"
                  className="pr-8"
                />
                <span className="absolute right-3 top-2 text-muted-foreground text-sm">
                  €
                </span>
              </div>
            </div>

            <div className="grid gap-3 overflow-hidden">
              <Label className="text-sm font-medium">
                Categoría <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.categoryId}
                onValueChange={(val) =>
                  setFormData({ ...formData, categoryId: val })
                }
              >
                <SelectTrigger className="w-full h-11 overflow-hidden">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent className="max-w-[300px] sm:max-w-[400px]">
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={cat.id.toString()}
                      title={cat.name}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción (Opcional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
                  <Label className="text-sm font-medium">
                    Gestión de Stock
                  </Label>
                  <Tabs
                    value={formData.trackStock ? "limited" : "infinite"}
                    onValueChange={(val) => {
                      setFormData({
                        ...formData,
                        trackStock: val === "limited",
                      });
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
                    <Label
                      htmlFor="stock-qty"
                      className="text-xs text-muted-foreground"
                    >
                      Cantidad disponible
                    </Label>
                    <Input
                      id="stock-qty"
                      type="number"
                      placeholder="Ej. 10"
                      className="bg-background"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentStock: e.target.value,
                        })
                      }
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 sm:pt-0 sm:pl-4 sm:border-l flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 pr-2">
                    <Label
                      className="text-sm font-medium"
                      htmlFor="edit-available"
                    >
                      Activo en Menú
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-tight">
                      Desactiva para ocultarlo del cliente.
                    </p>
                  </div>
                  <Switch
                    id="edit-available"
                    checked={formData.isAvailable}
                    onCheckedChange={(val) =>
                      setFormData({ ...formData, isAvailable: val })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-muted/10">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto h-11"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
            </SheetClose>
            <Button
              className="w-full sm:w-auto h-11"
              onClick={handleLocalSave}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {product ? "Guardar Cambios" : "Crear Plato"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
