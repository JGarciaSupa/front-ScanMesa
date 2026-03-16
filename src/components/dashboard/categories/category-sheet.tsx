import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
}

interface CategorySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingCategory: Category | null;
  formData: {
    name: string;
    description: string;
    isActive: boolean;
  };
  onFormDataChange: (data: any) => void;
  onSave: () => void;
  submitting: boolean;
}

export function CategorySheet({
  isOpen,
  onOpenChange,
  editingCategory,
  formData,
  onFormDataChange,
  onSave,
  submitting,
}: CategorySheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
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
              Nombre de la Categoría <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={formData.name}
              onChange={(e) =>
                onFormDataChange({ ...formData, name: e.target.value })
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
                onFormDataChange({ ...formData, description: e.target.value })
              }
              placeholder="Ej. Nuestra selección de tés e infusiones artesanales."
              className="resize-none min-h-[90px] bg-background"
            />
          </div>

          <div className="bg-background p-5 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold" htmlFor="cat-active">
                  Visibilidad en Menú
                </Label>
                <p className="text-sm text-muted-foreground max-w-[200px] leading-relaxed">
                  Si desactivas esta opción, todos los platillos dentro de esta
                  categoría quedarán ocultos temporalmente.
                </p>
              </div>
              <Switch
                id="cat-active"
                checked={formData.isActive}
                onCheckedChange={(val) =>
                  onFormDataChange({ ...formData, isActive: val })
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
              onClick={onSave}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingCategory ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
