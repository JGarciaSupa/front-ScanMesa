import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface CategoryDeleteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onConfirm: () => void;
  submitting: boolean;
}

export function CategoryDeleteModal({
  isOpen,
  onOpenChange,
  category,
  onConfirm,
  submitting,
}: CategoryDeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[400px]">
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-start text-xl">
            ¿Eliminar categoría?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-start">
            Esta acción es{" "}
            <span className="font-bold text-foreground">irreversible</span>. Se
            eliminarán permanentemente la categoría{" "}
            <span className="font-semibold text-foreground">
              "{category?.name}"
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
            className="w-full sm:w-auto"
            onClick={onConfirm}
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
  );
}
