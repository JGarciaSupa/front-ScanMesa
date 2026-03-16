"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Product } from "./types";

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  categories: { id: number; name: string }[];
  currency: string;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  categories,
  currency
}: ProductDetailModalProps) {
  
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-md border-none">
        <div className="flex flex-col">
          <div className="relative h-64 w-full">
            <img 
              src={product.imageUrl || ""} 
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
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
            <Badge 
              variant="secondary" 
              className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-zinc-900 border-none shadow-sm px-3 py-0.5 font-semibold"
            >
              {categories.find(c => c.id === product.categoryId)?.name}
            </Badge>
            <Button 
              variant="secondary" 
              size="icon" 
              className="absolute top-4 right-4 text-white border-none h-8 w-8 flex items-center justify-center p-0"
              onClick={onClose}
            >
              <Plus className="w-4 h-4 rotate-45" />
            </Button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-2">
              <div className="flex-1 min-w-[250px]">
                <DialogTitle className="text-2xl font-bold text-zinc-900 leading-tight line-clamp-2">
                  {product.name}
                </DialogTitle>
              </div>
              <div className="shrink-0">
                <span className="text-2xl font-bold text-zinc-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
            
            <DialogDescription className="text-zinc-600 leading-relaxed text-base line-clamp-5">
              {product.description || "Sin descripción disponible."}
            </DialogDescription>

            {product.trackStock && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  product.currentStock > 0 ? "bg-green-500" : "bg-red-500"
                )} />
                <span className="text-zinc-500">
                  {product.currentStock > 0 
                    ? `${product.currentStock} unidades disponibles`
                    : "Agotado"}
                </span>
              </div>
            )}

            <div className="pt-4">
              <Button 
                className="w-full h-12 rounded-md font-bold bg-zinc-900 hover:bg-black text-white shadow-lg flex items-center justify-center gap-2"
                disabled={!product.isAvailable || (product.trackStock && product.currentStock <= 0)}
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
              >
                <Plus className="w-5 h-5" />
                Añadir al pedido
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
