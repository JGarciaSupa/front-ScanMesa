"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Product } from "./types";

interface ProductCardProps {
  product: Product;
  currency: string;
  onAddToCart: (product: Product) => void;
  onSelectDetail: (product: Product) => void;
}

export default function ProductCard({
  product,
  currency,
  onAddToCart,
  onSelectDetail
}: ProductCardProps) {
  const isOutOfStock = product.trackStock && product.currentStock <= 0;
  const isDisabled = !product.isAvailable || isOutOfStock;

  return (
    <Card 
      className={cn(
        "py-0 overflow-hidden border-0 shadow-sm rounded-md bg-white hover:shadow-md transition-all relative cursor-pointer active:scale-[0.98]",
        isDisabled && "opacity-60 grayscale-[0.5] cursor-not-allowed"
      )}
      onClick={() => !isDisabled && onAddToCart(product)}
    >
      {isDisabled && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
          <Badge variant="destructive" className="px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm border-none bg-red-600 text-white">
            Agotado
          </Badge>
        </div>
      )}
      <div className="flex flex-row h-28 md:h-40">
        <div 
          className="w-1/3 min-w-25 shrink-0 bg-stone-100 relative overflow-hidden group/img"
          onClick={(e) => {
            e.stopPropagation();
            if (!isDisabled) onSelectDetail(product);
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform"
            loading="lazy"
          />
        </div>
        <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
          <div className="overflow-hidden">
            <div className="flex justify-between items-start gap-1">
              <h3 
                className="font-bold text-sm md:text-lg text-zinc-900 leading-tight mb-0.5 line-clamp-2 flex-1 hover:underline decoration-zinc-300 underline-offset-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDisabled) onSelectDetail(product);
                }}
              >
                {product.name}
              </h3>
              {product.trackStock && product.currentStock > 0 && product.currentStock <= 5 && (
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                  Últimos {product.currentStock}
                </span>
              )}
            </div>
            <p className="text-[11px] md:text-sm text-zinc-500 line-clamp-2 leading-tight">
              {product.description}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-sm md:text-base text-zinc-900">
              {formatPrice(product.price)}
            </span>
            <Button
              size="icon"
              variant="default"
              disabled={isDisabled}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 shadow-sm transform active:scale-90 transition-transform disabled:bg-zinc-200 disabled:text-zinc-400"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
