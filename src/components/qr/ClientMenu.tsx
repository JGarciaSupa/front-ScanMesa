"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Share2, Receipt, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

interface ClientMenuProps {
  tableId: string;
  tenantData: {
    info: {
      id: number;
      name: string;
      logoUrl: string | null;
      bannerUrl: string | null;
      currency: string | null;
      defaultTaxRate: string | null;
    };
    categories: { id: number; name: string }[];
    products: Product[];
  };
}

export default function ClientMenu({ tableId, tenantData }: ClientMenuProps) {
  const router = useRouter();
  const [guestId, setGuestId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [tableName, setTableName] = useState("");
  const [internalTableId, setInternalTableId] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [isTableOccupied, setIsTableOccupied] = useState<boolean>(false);
  const [isCodePreFilled, setIsCodePreFilled] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionChecking, setIsSessionChecking] = useState(true);

  const getTenantSlug = () => {
    const host = window.location.hostname;
    const subDomain = host.split('.')[0] ?? "";
    return subDomain.replace('-', '_');
  };

  useEffect(() => {
    const fetchTableInfo = async () => {
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/tables/hash/${tableId}`, {
          headers: { "x-schema-tenant": tenantSlug },
        });
        const result = await response.json();
        if (result.success && result.data) {
          setTableName(result.data.name);
          setInternalTableId(result.data.id);
        } else {
          router.push('/qr');
        }
      } catch (error) {
        console.error("Error fetching table info:", error);
        router.push('/qr');
      }
    };

    const checkSession = async () => {
      try {
        const tenantSlug = getTenantSlug();
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/orders/session/${tableId}`, {
          headers: { "x-schema-tenant": tenantSlug },
        });
        const result = await response.json();
        
        if (result.success) {
          if (result.data) {
            setIsTableOccupied(true);
            setSessionCode(result.data.code);
            setSessionId(result.data.id);

            // Recuperar sesión persistida si coincide con la sesión activa de la mesa
            const savedSession = localStorage.getItem(`table_session_${tableId}`);
            if (savedSession) {
              const { guestId: savedGuestId, guestName: savedGuestName, sessionId: savedSessionId } = JSON.parse(savedSession);
              if (savedSessionId === result.data.id) {
                setGuestId(savedGuestId);
                setGuestName(savedGuestName);
              }
            }
          } else {
            // Mesa está libre
            localStorage.removeItem(`table_session_${tableId}`);
            setIsTableOccupied(false);
            setGuestId(null);
            setGuestName("");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsSessionChecking(false);
      }
    };

    fetchTableInfo();
    checkSession();

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");
      
      if (codeParam) {
        setCodeInput(codeParam.toUpperCase());
        setIsCodePreFilled(true);
      }
    }
  }, [tableId]);

  if (isSessionChecking) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">Cargando mesa...</p>
      </div>
    );
  }

  const isModalOpen = !guestName;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim().length > 0) {
      setIsLoading(true);
      try {
        const tenantSlug = getTenantSlug();
        if (!isTableOccupied) {
          // Abrir nueva mesa
          const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/orders/session/open`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-schema-tenant': tenantSlug 
            },
            body: JSON.stringify({
              tableId: internalTableId || parseInt(tableId),
              guestName: nameInput.trim(),
              code: generatedCode
            })
          });
          const result = await response.json();
          if (result.success) {
            const newGuestName = nameInput.trim();
            const newGuestId = result.data.guest.id;
            const newSessionId = result.data.session.id;

            setGuestName(newGuestName);
            setGuestId(newGuestId);
            setSessionId(newSessionId);
            setSessionCode(result.data.session.code);
            
            // Persistir sesión
            localStorage.setItem(`table_session_${tableId}`, JSON.stringify({
              guestId: newGuestId,
              guestName: newGuestName,
              sessionId: newSessionId
            }));

            showToast("Mesa lista", "success");
          } else {
            showToast("Error", "error");
          }
        } else {
          // Unirse a mesa existente
          if (codeInput.trim().length < 6 && !isCodePreFilled) {
            showToast("Código incompleto", "error");
            return;
          }
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/orders/session/join`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-schema-tenant': tenantSlug 
            },
            body: JSON.stringify({
              sessionId: sessionId,
              guestName: nameInput.trim(),
              code: codeInput.trim()
            })
          });
          const result = await response.json();
          if (result.success) {
            const newGuestName = nameInput.trim();
            const newGuestId = result.data.id;

            setGuestName(newGuestName);
            setGuestId(newGuestId);

            // Persistir sesión
            localStorage.setItem(`table_session_${tableId}`, JSON.stringify({
              guestId: newGuestId,
              guestName: newGuestName,
              sessionId: sessionId
            }));

            showToast("Bienvenido", "success");
          } else {
            setCodeInput("");
            showToast("Código inválido", "error");
          }
        }
      } catch (error) {
        console.error("Error joining table:", error);
        showToast("Fallo red", "error");
      } finally {
        setIsLoading(false);
      }
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

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 2500);
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
    showToast(`${product.name} +1`, "success");
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

  const confirmOrder = async () => {
    if (!sessionId || !guestId) return;
    
    setIsLoading(true);
    try {
      const tenantSlug = getTenantSlug();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-schema-tenant': tenantSlug 
        },
        body: JSON.stringify({
          sessionId,
          guestId,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity
          }))
        })
      });
      const result = await response.json();
      if (result.success) {
        showToast("¡Pedido enviado a cocina!");
        setCart([]);
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      showToast("Error al enviar el pedido");
    } finally {
      setIsLoading(false);
    }
  };

  const cartTotalElements = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const filteredProducts = selectedCategoryId === 0 
    ? tenantData.products 
    : tenantData.products.filter((p) => Number(p.categoryId) === selectedCategoryId);

  return (
    <div className="w-full max-w-480 mx-auto min-h-screen bg-[#FAF8F4] relative pb-28">
      {/* Toast Animado Ultracorto */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transform transition-all animate-in fade-in slide-in-from-top-4 border ${
          toastType === "success" 
          ? "bg-zinc-900 text-white border-zinc-800" 
          : "bg-red-600 text-white border-red-500"
        }`}>
          {toastType === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-white" />
          )}
          <span className="text-sm font-bold">{toastMessage}</span>
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
            <DialogTitle className="text-xl font-bold text-center">¡Bienvenido a la {tableName || `Mesa ${tableId}`}!</DialogTitle>
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
                    <InputOTPSlot index={0} className="w-10 h-12 text-lg rounded-xl border border-zinc-200 font-bold !rounded-xl" />
                    <InputOTPSlot index={1} className="w-10 h-12 text-lg rounded-xl border border-zinc-200 font-bold !rounded-xl" />
                    <InputOTPSlot index={2} className="w-10 h-12 text-lg rounded-xl border border-zinc-200 font-bold !rounded-xl" />
                    <InputOTPSlot index={3} className="w-10 h-12 text-lg rounded-xl border border-zinc-200 font-bold !rounded-xl" />
                    <InputOTPSlot index={4} className="w-10 h-12 text-lg rounded-xl border border-zinc-200 font-bold !rounded-xl" />
                    <InputOTPSlot index={5} className="w-10 h-12 text-lg rounded-xl border border-zinc-200 font-bold !rounded-xl" />
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
              disabled={isLoading || !nameInput.trim() || (isTableOccupied && !isCodePreFilled && codeInput.length < 6)}
              className="h-12 rounded-xl text-lg font-semibold w-full mt-2"
            >
              {isLoading ? "Procesando..." : (isTableOccupied ? "Unirse a la mesa" : "Abrir nueva mesa")}
            </Button>
            
            {/* Simulación eliminada para producción */}
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
        <div className="absolute top-4 left-0 right-0 px-4 flex flex-wrap items-center justify-between gap-2 z-10">
          <Badge variant="secondary" className="bg-white/95 text-black border-0 font-bold whitespace-nowrap text-[10px] md:text-sm py-1 px-2">
            📍 {tableName || `Mesa ${tableId}`} • {sessionCode}
          </Badge>
          
          <div className="flex items-center gap-1.5 ml-auto">
            <Button 
              variant="secondary" 
              size="icon" 
              className="bg-white/95 hover:bg-white text-black h-8 w-8 rounded-full shrink-0 shadow-sm"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Link href={`/qr/${tableId}/checkout`}>
              <Button variant="secondary" size="sm" className="bg-white/95 hover:bg-white text-black border-0 font-bold h-8 px-3 rounded-full shadow-sm text-xs">
                <Receipt className="w-3.5 h-3.5 mr-1" />
                Cuenta
              </Button>
            </Link>
            <ButtonWaiterdCalled tableId={internalTableId || parseInt(tableId)} />
          </div>
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
              <span className="text-white text-xs font-medium flex items-center gap-1 bg-black/30 py-0.5 rounded-full backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5" />
                <span>Abierto · Cierra a las 23:30</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido interactivo: Categorías y Productos */}
      <div className="sticky top-0 z-40 bg-[#FAF8F4]/95 backdrop-blur-md border-b border-stone-200/60 py-3">
        <div className="max-w-7xl mx-auto">
          <ScrollArea className="w-full">
            <div className="flex w-max space-x-2 px-4 pb-2">
              <Button
                variant={selectedCategoryId === 0 ? "default" : "secondary"}
                className={`rounded-full px-5 font-medium transition-all ${
                  selectedCategoryId === 0 
                  ? "bg-zinc-900 text-white shadow-md" 
                  : "bg-white text-zinc-600 hover:bg-zinc-100 border border-stone-200"
                }`}
                onClick={() => setSelectedCategoryId(0)}
              >
                Todos
              </Button>
              {tenantData.categories.map((cat) => (
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
            <Card key={product.id} className="py-0 overflow-hidden border-0 shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
              <div className="flex flex-row h-28 md:h-40">
                <div className="w-1/3 min-w-[100px] shrink-0 bg-stone-100 relative overflow-hidden">
                  <img
                    src={product.imageUrl || "/placeholder-food.jpg"}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 p-3 md:p-4 flex flex-col justify-between min-w-0">
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-sm md:text-lg text-zinc-900 leading-tight mb-0.5 truncate">{product.name}</h3>
                    <p className="text-[11px] md:text-sm text-zinc-500 line-clamp-2 leading-tight">
                      {product.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-sm md:text-base text-zinc-900">
                      €{Number(product.price).toFixed(2)}
                    </span>
                    <Button
                      size="icon"
                      variant="default"
                      className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 shadow-sm transform active:scale-90 transition-transform"
                      onClick={() => addToCart(product)}
                    >
                      <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
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
