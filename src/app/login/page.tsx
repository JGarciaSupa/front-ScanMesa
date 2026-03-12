"use client";

import { useState } from "react";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Simulando la información del tenant (restaurante)
const tenant = {
  name: "Osteria Venezia",
  logoUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop",
  bannerUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=900&fit=crop"
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulando una llamada a API
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Acceso concedido a ${tenant.name}`, {
        description: "Redirigiendo al panel de control...",
      });
      // El ruteo real iría aquí
      // router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Sección Izquierda (Branding del Restaurante - Solo visible en lg/desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative shrink-0">
        <img 
          src={tenant.bannerUrl}
          alt={`Restaurante ${tenant.name}`}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-16 left-12 z-10 w-full pr-12">
          <h1 className="text-white text-5xl font-bold tracking-tight">
            Sistema Interno <br />
            <span className="text-white/90">{tenant.name}</span>
          </h1>
          <p className="text-white/80 mt-4 text-lg max-w-lg">
            Gestión de pedidos, inventario y personal en un solo lugar.
          </p>
        </div>
      </div>

      {/* Sección Derecha (Formulario de Login) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="space-y-6 flex flex-col items-center text-center pb-6">
            <Avatar className="w-28 h-28 border shadow-md">
              <AvatarImage src={tenant.logoUrl} alt={tenant.name} className="object-cover" />
              <AvatarFallback className="text-3xl bg-primary/10 text-primary font-medium">
                {tenant.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight">Bienvenido de vuelta</h2>
              <p className="text-base text-muted-foreground">
                Ingresa tus credenciales para acceder al panel de <span className="font-medium text-foreground">{tenant.name}</span>.
              </p>
            </div>
          </div>
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="tu@correo.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </div>
          <div className="flex justify-center pt-8 pb-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80 font-medium">
              Powered by <span className="font-bold text-muted-foreground">YoPido SaaS</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
