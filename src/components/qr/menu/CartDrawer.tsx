"use client";

import { SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetDescription, Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { CartItem } from "./types";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  cart: CartItem[];
  guestName: string;
  cartTotalElements: number;
  cartTotalPrice: number;
  updateQuantity: (productId: number, delta: number) => void;
  removeFromCart: (productId: number) => void;
  confirmOrder: () => void;
  tableId: string;
  currency?: string;
}

export default function CartDrawer({
  cart,
  guestName,
  cartTotalElements,
  cartTotalPrice,
  updateQuantity,
  removeFromCart,
  confirmOrder,
  tableId,
  currency = '€'
}: CartDrawerProps) {
  return (
    <Sheet>
      {cartTotalElements > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto">
            <SheetTrigger asChild>
              <Button className="w-full rounded-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-zinc-800 flex items-center justify-between px-6 text-lg font-semibold group transition-all">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6" />
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex flex-col items-center justify-center rounded-full border-2 border-zinc-900">
                      {cartTotalElements}
                    </span>
                  </div>
                  <span>Ver tu pedido</span>
                </div>
                <span>{formatPrice(cartTotalPrice)}</span>
              </Button>
            </SheetTrigger>
          </div>
        </div>
      )}

      <SheetContent side="bottom" className="h-[90vh] md:h-auto md:max-h-[90vh] md:side-right md:w-100 flex flex-col rounded-t-3xl md:rounded-l-3xl p-0 bg-[#FAF8F4] overflow-hidden">
          <SheetHeader className="p-6 pb-4 border-b border-stone-200/80 bg-white">
            <SheetTitle className="text-2xl font-extrabold text-left flex items-center gap-2 min-w-0 pr-10">
              <span className="shrink-0 whitespace-nowrap">Tu pedido</span>
              <span className="text-zinc-400 font-medium text-lg shrink-0">·</span>
              <span className="text-zinc-500 font-medium text-lg truncate">{guestName}</span>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Resumen de los productos que has añadido a tu carrito.
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 p-6 [&_[data-slot='scroll-area-viewport']>div]:block!">
            <ul className="flex flex-col gap-6">
              {cart.map((item) => (
                <li key={item.product.id} className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 shadow-sm border border-black/5">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-zinc-900 leading-tight line-clamp-2">{item.product.name}</span>
                      <span className="font-bold text-zinc-900 whitespace-nowrap ml-4">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center bg-white border border-stone-200 rounded-full overflow-hidden shadow-sm">
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-stone-50 transition-colors active:bg-stone-100"
                          onClick={() => updateQuantity(item.product.id, -1)}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold select-none">{item.quantity}</span>
                        <button
                          type="button"
                          className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-stone-50 transition-colors active:bg-stone-100"
                          onClick={() => updateQuantity(item.product.id, 1)}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="text-red-400 hover:text-red-600 transition-colors p-2 -ml-2 rounded-full hover:bg-red-50"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>

          <SheetFooter className="p-6 bg-white border-t border-stone-200/80 mt-auto shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            {cart.length > 0 ? (
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center text-zinc-500 font-medium">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotalPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-extrabold text-zinc-900 border-t border-stone-100 pt-3">
                  <span>Total</span>
                  <span>{formatPrice(cartTotalPrice)}</span>
                </div>
                <Button 
                  className="w-full h-12 rounded-2xl text-lg font-bold bg-zinc-900 hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all"
                  onClick={confirmOrder}
                >
                  Confirmar pedido
                </Button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-4 py-2">
                <span className="text-zinc-500 text-sm font-medium">No tienes items pendientes de enviar</span>
                <Link href={`/qr/${tableId}/checkout`} className="w-full">
                  <Button className="w-full h-12 rounded-md text-lg font-bold" variant="default">
                    Ver cuenta
                  </Button>
                </Link>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
    </Sheet>
  );
}
