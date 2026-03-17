"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Image as ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  onToggleAvailable: (id: number, currentVal: boolean) => Promise<void>;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => Promise<void>;
}

export function ProductCard({
  product,
  onToggleAvailable,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Card
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
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.retried && product.imageUrl) {
                target.dataset.retried = "true";
                setTimeout(() => {
                  target.src = product.imageUrl + "?retry=" + Date.now();
                }, 500);
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className="max-w-[150px] shadow-sm backdrop-blur-md bg-background/80 text-foreground hover:bg-background/90 border-none px-2 justify-start">
            <span className="block truncate">
              {product.categoryName || "Sin Categoría"}
            </span>
          </Badge>
          {product.trackStock && product.currentStock <= 0 && (
            <Badge
              variant="destructive"
              className="shadow-sm flex items-center gap-1"
            >
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
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-md border shadow-sm ${
                product.currentStock > 0
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-destructive/10 text-destructive border-destructive/20"
              }`}
            >
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
              onCheckedChange={() =>
                onToggleAvailable(product.id, product.isAvailable)
              }
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
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
