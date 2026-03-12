"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Share2, Receipt } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import ButtonWaiterdCalled from "@/components/qr/ButtonWaiterdCalled";

type Product = {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

const MOCK_CATEGORIES = [
  { id: 1, name: "Entrantes" },
  { id: 2, name: "Pizzas" },
  { id: 3, name: "Bebidas" },
  { id: 4, name: "Postres" },
];

const MOCK_PRODUCTS: Product[] = [
  { id: 101, categoryId: 1, name: "Burrata", price: 12.5, description: "Con tomate cherry rociado en AOVE y pesto", imageUrl: "https://images.unsplash.com/photo-1608897013039-887f214b985c?q=80&w=600&auto=format&fit=crop" },
  { id: 102, categoryId: 1, name: "Provolone", price: 9.0, description: "Fundido con orégano y un toque de ají", imageUrl: "https://plus.unsplash.com/premium_photo-1671542981545-2070ab950882?q=80&w=600&auto=format&fit=crop" },
  { id: 103, categoryId: 2, name: "Pizza Margarita", price: 10.0, description: "Tomate San Marzano, mozzarella fior di latte, albahaca", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop" },
  { id: 104, categoryId: 2, name: "Pizza Diavola", price: 13.0, description: "Pepperoni picante estilo napolitano", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop" },
  { id: 105, categoryId: 3, name: "Cerveza Artesanal", price: 4.5, description: "IPA local muy refrescante y aromática (33cl)", imageUrl: "https://images.unsplash.com/photo-1538485395224-329273c52de3?q=80&w=600&auto=format&fit=crop" },
  { id: 106, categoryId: 4, name: "Tiramisú", price: 6.0, description: "Casero con mascarpone puro y café de especialidad", imageUrl: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?q=80&w=600&auto=format&fit=crop" },
];

interface ClientMenuProps {
  tableId: string;
  tenantData: any;
}

export default function ClientMenu({ tableId, tenantData }: ClientMenuProps) {
  const [guestName, setGuestName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [isTableOccupied, setIsTableOccupied] = useState<boolean>(false);
  const [isCodePreFilled, setIsCodePreFilled] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(MOCK_CATEGORIES[0].id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");
      const occupiedParam = urlParams.get("occupied");
      
      if (codeParam) {
        setCodeInput(codeParam.toUpperCase());
        setIsTableOccupied(true);
        setIsCodePreFilled(true);
      } else if (occupiedParam === "true") {
        setIsTableOccupied(true);
      }
    }
  }, []);

  const isModalOpen = !guestName;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim().length > 0) {
      if (isTableOccupied && codeInput.trim().length < 6) {
        showToast("Código de 6 dígitos requerido.");
        return;
      }
      setGuestName(nameInput.trim());
      // Si la mesa estaba ocupada validamos codigo, si es mesa nueva generamos 6 digitos.
      setSessionCode(codeInput.trim() || Math.floor(100000 + Math.random() * 900000).toString());
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?code=${sessionCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Únete a mi mesa",
          text: `Únete a la Mesa ${tableId} en ${tenantData.info.name}. Código de mesa: ${sessionCode}`,
          url: shareUrl,
        });
        showToast("¡Enlace compartido!");
      } catch (err) {
        console.error("Error al compartir", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast("¡Enlace copiado!");
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`¡Agregado ${product.name}!`);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const confirmOrder = () => {
    alert("¡Pedido enviado a cocina!");
    setCart([]);
  };

  const cartTotalElements = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const filteredProducts = MOCK_PRODUCTS.filter((p) => p.categoryId === selectedCategoryId);

  return (
    <div className="w-full max-w-480 mx-auto min-h-screen bg-[#FAF8F4] relative pb-28">
      {/* Toast Animado */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform transition-all animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Welcome Modal */}
      <Dialog open={isModalOpen}>
        {/* Usamos onOpenChange vacío y pointer-events-none en la capa base suele no ser suficiente, pero no renderizamos el botón Close 
            El usuario NO puede cerrarlo a menos que llene su nombre. */}
        <DialogContent 
          className="sm:max-w-md w-11/12 rounded-xl"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">¡Bienvenido a la Mesa {tableId}!</DialogTitle>
            <DialogDescription className="text-center pt-2 pb-4 text-base">
              {isTableOccupied 
                ? isCodePreFilled 
                  ? "Te invitó alguien a esta mesa. Escribe tu nombre para entrar."
                  : "Esta mesa ya está ocupada. Ingresa tu nombre y el código de invitación que te enviaron."
                : "Parece que eres el primero aquí. Escribe tu nombre para abrir la mesa."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleJoin} className="flex flex-col gap-5">
            <Input
              placeholder="Tu nombre (Ej. Ana)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="h-12 text-lg rounded-xl"
              autoFocus
            />
            
            {isTableOccupied && !isCodePreFilled && (
              <div className="flex flex-col items-center justify-center gap-3">
                <span className="text-sm font-medium text-zinc-500">Código de mesa (6 dígitos)</span>
                <InputOTP 
                  maxLength={6} 
                  value={codeInput}
                  onChange={(val) => setCodeInput(val)}
                  required
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="w-12 h-14 text-xl rounded-xl border-zinc-200 font-bold" />
                    <InputOTPSlot index={1} className="w-12 h-14 text-xl rounded-xl border-zinc-200 font-bold" />
                    <InputOTPSlot index={2} className="w-12 h-14 text-xl rounded-xl border-zinc-200 font-bold" />
                    <InputOTPSlot index={3} className="w-12 h-14 text-xl rounded-xl border-zinc-200 font-bold" />
                    <InputOTPSlot index={4} className="w-12 h-14 text-xl rounded-xl border-zinc-200 font-bold" />
                    <InputOTPSlot index={5} className="w-12 h-14 text-xl rounded-xl border-zinc-200 font-bold" />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            )}

            {isTableOccupied && isCodePreFilled && (
              <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium border border-green-200/50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                Invitación válida detectada
              </div>
            )}

            <Button
              type="submit"
              disabled={!nameInput.trim() || (isTableOccupied && codeInput.length < 6)}
              className="h-12 rounded-xl text-lg font-semibold w-full mt-2"
            >
              {isTableOccupied ? "Unirse a la mesa" : "Abrir nueva mesa"}
            </Button>
            
            {/* Simulación para probar ambos ciclos localmente sin interactuar con un API */}
            <div className="flex justify-center mt-2">
              <button 
                type="button" 
                onClick={() => setIsTableOccupied(!isTableOccupied)}
                className="text-xs text-zinc-400 hover:text-zinc-600 underline"
              >
                (Mock: Alternar estado de mesa {isTableOccupied ? "ocupada" : "libre"})
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Principal Header */}
      <header className="relative w-full h-56 md:h-64 lg:h-80 overflow-hidden bg-black/80">
        <img
          src={tenantData.info.bannerUrl || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400&q=90"}
          alt="Restaurant cover"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%)" }}
        />
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white border-0 font-medium whitespace-nowrap">
            📍 Mesa {tableId} • Cód: {sessionCode}
          </Badge>
          <Button 
            variant="secondary" 
            size="icon" 
            className="bg-white/90 hover:bg-white text-black h-6 w-6 rounded-full shrink-0"
            onClick={handleShare}
            title="Compartir mesa"
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>
          <Link href={`/qr/${tableId}/checkout`}>
            <Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-black border-0 font-medium">
              <Receipt className="w-4 h-4 mr-2" />
              Ver cuenta
            </Button>
          </Link>
          <ButtonWaiterdCalled />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-4 z-10">
          <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-white/20 shadow-xl shrink-0 bg-white">
            {tenantData.info.logoUrl ? (
              <AvatarImage src={tenantData.info.logoUrl} alt="logo" className="object-cover" />
            ) : (
              <AvatarFallback className="text-2xl font-bold bg-zinc-900 text-white">
                {tenantData.info.name[0]?.toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="pb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
              {tenantData.info.name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 opacity-80">
              <span className="text-white text-xs font-medium flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>Abierto · Cierra a las 23:30</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido interactivo: Categorías y Productos */}
      <div className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-stone-200/60 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex w-max space-x-2">
              {MOCK_CATEGORIES.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategoryId === cat.id ? "default" : "secondary"}
                  className={`rounded-full px-5 font-medium transition-all ${
                    selectedCategoryId === cat.id 
                    ? "bg-zinc-900 text-white shadow-md" 
                    : "bg-white text-zinc-600 hover:bg-zinc-100 border border-stone-200"
                  }`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="hidden" />
          </ScrollArea>
        </div>
      </div>

      <main className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-0 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
              <div className="flex h-32 md:h-40">
                <div className="w-2/5 shrink-0 bg-stone-100 flex-1 relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between w-full h-full">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-zinc-900 leading-tight mb-1">{product.name}</h3>
                    <p className="text-xs md:text-sm text-zinc-500 line-clamp-2 md:line-clamp-3 leading-snug">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-base text-zinc-900">
                      €{product.price.toFixed(2)}
                    </span>
                    <Button
                      size="icon"
                      variant="default"
                      className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 shadow-md transform active:scale-95 transition-transform"
                      onClick={() => addToCart(product)}
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Floating Action / Slide-out Drawer para Carrito */}
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
                  <span>€{cartTotalPrice.toFixed(2)}</span>
                </Button>
              </SheetTrigger>
            </div>
          </div>
        )}

        <SheetContent side="bottom" className="h-[90vh] md:h-auto md:max-h-[90vh] md:side-right md:w-[400px] flex flex-col rounded-t-3xl md:rounded-l-3xl p-0 bg-[#FAF8F4] overflow-hidden">
            <SheetHeader className="p-6 pb-4 border-b border-stone-200/80 bg-white">
              <SheetTitle className="text-2xl font-extrabold text-left flex items-center gap-2">
                Tu pedido <span className="text-zinc-400 font-medium text-lg">·</span> <span className="text-zinc-500 font-medium text-lg">{guestName}</span>
              </SheetTitle>
            </SheetHeader>
            
            <ScrollArea className="flex-1 p-6">
              <ul className="flex flex-col gap-6">
                {cart.map((item) => (
                  <li key={item.product.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 shadow-sm border border-black/5">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-zinc-900 leading-tight">{item.product.name}</span>
                        <span className="font-bold text-zinc-900 whitespace-nowrap ml-4">
                          €{(item.product.price * item.quantity).toFixed(2)}
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
                    <span>€{cartTotalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-extrabold text-zinc-900 border-t border-stone-100 pt-3">
                    <span>Total</span>
                    <span>€{cartTotalPrice.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl text-lg font-bold bg-zinc-900 hover:bg-black text-white shadow-xl hover:shadow-2xl transition-all"
                    onClick={confirmOrder}
                  >
                    Confirmar pedido
                  </Button>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-4 py-2">
                  <span className="text-zinc-500 text-sm font-medium">No tienes items pendientes de enviar</span>
                  <Link href={`/qr/${tableId}/checkout`} className="w-full">
                    <Button className="w-full h-14 rounded-2xl text-lg font-bold" variant="default">
                      🧾 Ir a Pagar / Dividir Cuenta
                    </Button>
                  </Link>
                </div>
              )}
            </SheetFooter>
          </SheetContent>
        </Sheet>
    </div>
  );
}
