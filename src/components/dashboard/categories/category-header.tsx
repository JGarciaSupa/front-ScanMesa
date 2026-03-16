import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CategoryHeaderProps {
  onNewCategory: () => void;
}

export function CategoryHeader({ onNewCategory }: CategoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground mt-1">
          Organiza cómo se muestran los productos en el menú de tus clientes.
        </p>
      </div>
      <Button
        onClick={onNewCategory}
        className="w-full sm:w-auto shrink-0 shadow-sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nueva Categoría
      </Button>
    </div>
  );
}
