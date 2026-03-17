"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Product, CartItem } from "./menu/types";

import WelcomeModal from "./menu/WelcomeModal";
import MenuHeader from "./menu/MenuHeader";
import CategoryTabs from "./menu/CategoryTabs";
import ProductCard from "./menu/ProductCard";
import CartDrawer from "./menu/CartDrawer";
import ProductDetailModal from "./menu/ProductDetailModal";

interface ClientMenuProps {
  tableId: string;
  tenantData: {
    info: {
      id: number;
      name: string;
      logoUrl: string | null;
      bannerUrl: string | null;
      currency: string | null;
      latitude: number | null;
      longitude: number | null;
      allowedRadiusMeters: number | null;
      radiusEnabled: boolean;
    };
    categories: { id: number; name: string }[];
    products: Product[];
  };
}

function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
  const [products, setProducts] = useState<Product[]>(tenantData.products);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionChecking, setIsSessionChecking] = useState(true);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'checking' | 'authorized' | 'denied' | 'out_of_range'>('idle');
  const [distance, setDistance] = useState<number | null>(null);

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

            const savedSession = localStorage.getItem(`table_session_${tableId}`);
            if (savedSession) {
              const { guestId: savedGuestId, guestName: savedGuestName, sessionId: savedSessionId } = JSON.parse(savedSession);
              if (savedSessionId === result.data.id) {
                setGuestId(savedGuestId);
                setGuestName(savedGuestName);
              }
            }
          } else {
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

    const checkInitialLocation = async () => {
      // Solo validamos ubicación si el radio está habilitado y el usuario no ha entrado aún
      if (tenantData.info.radiusEnabled && !guestName) {
        setLocationStatus('checking');
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) {
              reject(new Error("Browser not supported"));
              return;
            }
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          });

          const { latitude: userLat, longitude: userLon } = position.coords;
          const restLat = typeof tenantData.info.latitude === "string" ? parseFloat(tenantData.info.latitude) : tenantData.info.latitude;
          const restLon = typeof tenantData.info.longitude === "string" ? parseFloat(tenantData.info.longitude) : tenantData.info.longitude;
          const allowedRadius = tenantData.info.allowedRadiusMeters || 50;

          if (restLat !== null && restLon !== null && !isNaN(restLat) && !isNaN(restLon)) {
            const dist = getDistanceInMeters(userLat, userLon, restLat, restLon);
            setDistance(dist);
            if (dist <= allowedRadius) {
              setLocationStatus('authorized');
            } else {
              setLocationStatus('out_of_range');
            }
          } else {
            // Si el restaurante no tiene coordenadas configuradas pero el radiusEnabled está en true
            // permitimos por ahora para no bloquear, o podrías marcar como error de config.
            setLocationStatus('authorized');
          }
        } catch (error: any) {
          console.error("GPS mount error:", error);
          setLocationStatus('denied');
        }
      } else {
        setLocationStatus('authorized');
      }
    };

    fetchTableInfo();
    checkSession();
    checkInitialLocation();

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get("code");
      
      if (codeParam) {
        setCodeInput(codeParam.toUpperCase());
        setIsCodePreFilled(true);
      }
    }
  }, [tableId, router]);

  useEffect(() => {
    if (!guestName || !sessionId) return;

    let mounted = true;
    let socket: WebSocket | null = null;
    let reconnectTimeout: any;

    const initSocket = () => {
      try {
        const tenantSlug = getTenantSlug();
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        const wsUrl = new URL(`${apiUrl.replace(/^http/, 'ws')}/ws`);
        wsUrl.searchParams.set('tenantId', tenantSlug);
        wsUrl.searchParams.set('isGuest', 'true');

        if (socket) {
          socket.onclose = null;
          socket.onmessage = null;
          socket.onopen = null;
          socket.close();
        }

        socket = new WebSocket(wsUrl.toString());

        socket.onopen = () => {
          if (!mounted) return;
          console.log('[WS Cliente] Conectado');
          // Podríamos re-verificar la sesión aquí si quisiéramos ser ultra-robustos
        };

        socket.onmessage = (event) => {
          if (!mounted) return;
          try {
            const { event: eventName, data } = JSON.parse(event.data);
            
            if (eventName === 'session:closed' && data.sessionId === sessionId) {
              localStorage.removeItem(`table_session_${tableId}`);
              setGuestName("");
              setGuestId(null);
              setSessionId(null);
              setIsTableOccupied(false);
              showToast("La mesa ha sido cerrada", "error");
            }

            if (eventName === 'guest:joined' && data.sessionId === sessionId) {
              if (data.guestId !== guestId) {
                showToast(`${data.guestName} se unió a la mesa`, "success");
              }
            }

            if (eventName === 'table:opened' && data.tableId === (internalTableId || parseInt(tableId))) {
                setIsTableOccupied(true);
            }

            if (eventName === 'product:created') {
              setProducts(prev => [...prev, data]);
            }

            if (eventName === 'product:updated') {
              setProducts(prev => prev.map(p => p.id === data.id ? { ...p, ...data } : p));
            }

            if (eventName === 'product:deleted') {
              setProducts(prev => prev.filter(p => p.id !== data.id));
            }
          } catch (e) {
            console.error('[WS Cliente] Error procesando mensaje:', e);
          }
        };

        socket.onclose = () => {
          if (mounted) {
            reconnectTimeout = setTimeout(initSocket, 3000);
          }
        };

        socket.onerror = (err) => {
          console.error('[WS Cliente] Error en WebSocket:', err);
        };
      } catch (error) {
        console.error('[WS Cliente] Fallo al inicializar socket:', error);
        if (mounted) reconnectTimeout = setTimeout(initSocket, 5000);
      }
    };

    initSocket();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimeout);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [guestName, sessionId, tableId, internalTableId, guestId]);

  if (isSessionChecking || (tenantData.info.radiusEnabled && locationStatus === 'checking')) {
    return (
      <div className="w-full min-h-screen bg-[#FAF8F4] flex flex-col items-center justify-center p-6 text-center">
        <div className="h-10 w-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mb-4" />
        <p className="text-zinc-500 font-medium">
          {locationStatus === 'checking' ? "Verificando ubicación..." : "Cargando mesa..."}
        </p>
      </div>
    );
  }

  const isModalOpen = !guestName;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim().length > 0) {
      setIsLoading(true);
      try {
        // Geolocation validation if restriction is enabled
        if (tenantData.info.radiusEnabled) {
          try {
            const position = await new Promise<GeolocationPosition>(
              (resolve, reject) => {
                if (!navigator.geolocation) {
                  reject(new Error("Geolocation not supported"));
                  return;
                }
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 8000,
                });
              },
            );

            const { latitude: userLat, longitude: userLon } = position.coords;

            // Ensure coordinates are numbers (numeric fields often come as strings)
            const restLat =
              typeof tenantData.info.latitude === "string"
                ? parseFloat(tenantData.info.latitude)
                : tenantData.info.latitude;
            const restLon =
              typeof tenantData.info.longitude === "string"
                ? parseFloat(tenantData.info.longitude)
                : tenantData.info.longitude;

            const allowedRadius = tenantData.info.allowedRadiusMeters || 50;

            if (
              restLat !== null &&
              restLon !== null &&
              !isNaN(restLat) &&
              !isNaN(restLon)
            ) {
              const distance = getDistanceInMeters(
                userLat,
                userLon,
                restLat,
                restLon,
              );

              if (distance > allowedRadius) {
                showToast(
                  `Estás a ${Math.round(distance)}m. Debes estar a menos de ${allowedRadius}m del local.`,
                  "error",
                );
                setIsLoading(false);
                return;
              }
            }
          } catch (error: any) {
            console.error("Geolocation error:", error);
            const msg =
              error.code === 1
                ? "Para pedir, debes permitir el acceso a tu ubicación GPS."
                : "No pudimos verificar tu ubicación. Asegúrate de tener el GPS activo.";
            showToast(msg, "error");
            setIsLoading(false);
            return;
          }
        }

        const tenantSlug = getTenantSlug();
        if (!isTableOccupied) {
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
            
            localStorage.setItem(`table_session_${tableId}`, JSON.stringify({
              guestId: newGuestId,
              guestName: newGuestName,
              sessionId: newSessionId,
              isHost: true
            }));

            showToast("Mesa lista", "success");
          } else {
            showToast(result.error || "Error", "error");
            if (result.error === "La mesa ya tiene una sesión activa") {
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
          }
        } else {
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

            localStorage.setItem(`table_session_${tableId}`, JSON.stringify({
              guestId: newGuestId,
              guestName: newGuestName,
              sessionId: sessionId,
              isHost: result.data.isHost || false
            }));

            showToast("Bienvenido", "success");
          } else {
            setCodeInput("");
            showToast(result.error || "Código inválido", "error");
            if (result.error === "Código de mesa inválido o sesión cerrada") {
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            }
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
    const existing = cart.find((item) => item.product.id === product.id);
    const quantityInCart = existing?.quantity || 0;

    if (product.trackStock && quantityInCart >= product.currentStock) {
      showToast(`Stock insuficiente de ${product.name}`, "error");
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(`${product.name} +1`, "success");
  };

  const updateQuantity = (productId: number, delta: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    if (delta > 0 && item.product.trackStock && item.quantity >= item.product.currentStock) {
      showToast(`No hay más stock disponible`, "error");
      return;
    }

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
      } else {
        showToast(result.error || "Error al enviar el pedido", "error");
      }
    } catch (error) {
      console.error("Error confirming order:", error);
      showToast("Error de conexión al enviar el pedido", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const cartTotalElements = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const filteredProducts = selectedCategoryId === 0 
    ? products 
    : products.filter((p) => Number(p.categoryId) === selectedCategoryId);

  return (
    <div className="w-full max-w-480 mx-auto min-h-screen bg-[#FAF8F4] relative pb-28">
      {/* Toast Animado Ultracorto */}
      {toastMessage && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-100 px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transform transition-all animate-in fade-in slide-in-from-top-4 border ${
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

      {/** Modal de bienvenida que solicita el nombre del cliente y el código de mesa si es necesario. */}
      <WelcomeModal 
        isOpen={isModalOpen}
        tableName={tableName}
        tableId={tableId}
        isTableOccupied={isTableOccupied}
        isCodePreFilled={isCodePreFilled}
        nameInput={nameInput}
        setNameInput={setNameInput}
        codeInput={codeInput}
        setCodeInput={setCodeInput}
        isLoading={isLoading}
        handleJoin={handleJoin}
        locationStatus={locationStatus}
      />

      {/** Encabezado del menú que muestra el banner, logo y nombre del restaurante, junto con info de la mesa. */}
      <MenuHeader 
        bannerUrl={tenantData.info.bannerUrl}
        logoUrl={tenantData.info.logoUrl}
        name={tenantData.info.name}
        tableId={tableId}
        tableName={tableName}
        sessionCode={sessionCode}
        handleShare={handleShare}
        internalTableId={internalTableId}
      />

      {/** Selector de categorías con scroll horizontal. */}
      <CategoryTabs 
        categories={tenantData.categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      <main className="px-4 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              currency={tenantData.info.currency || '€'}
              onAddToCart={addToCart}
              onSelectDetail={setSelectedDetailProduct}
            />
          ))}
        </div>
      </main>
      {/** Listado principal de productos (Tarjeta individual para mostrar la información básica). */}

      <CartDrawer 
        cart={cart}
        guestName={guestName}
        cartTotalElements={cartTotalElements}
        cartTotalPrice={cartTotalPrice}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        confirmOrder={confirmOrder}
        tableId={tableId}
        currency={tenantData.info.currency || '€'}
      />
      {/** Carrito de compras lateral/inferior que resume el pedido actual del cliente. */}

      <ProductDetailModal 
        product={selectedDetailProduct}
        isOpen={!!selectedDetailProduct}
        onClose={() => setSelectedDetailProduct(null)}
        onAddToCart={addToCart}
        categories={tenantData.categories}
        currency={tenantData.info.currency || '€'}
      />
      {/** Modal detallado que muestra toda la información de un producto seleccionado. */}
    </div>
  );
}
