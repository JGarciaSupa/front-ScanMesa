"use client";

import { Settings } from "@/app/dashboard/settings/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, MessageCircle } from "lucide-react";

interface SubscriptionProps {
  settings: Settings;
}

export default function Subscription({ settings }: SubscriptionProps) {
  // Calcular días restantes de suscripción
  const calculateDaysLeft = () => {
    const end = new Date(settings.subscriptionEnd);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft();
  const progressPercentage = Math.min(100, Math.max(0, (daysLeft / 365) * 100));

  const handleWhatsAppContact = () => {
    const phoneNumber = "+5193469928"; 
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    const message = `Hola, deseo pagar la suscripción desde esta web: ${currentUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="shadow-sm border-primary/20 bg-linear-to-br from-card to-primary/2">
      <CardHeader className="pb-4 border-b border-border/40">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              Plan Pro
              <Badge variant="default" className="text-xs ml-1 bg-linear-to-r from-primary to-primary/80 text-primary-foreground border-transparent">Activo</Badge>
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Tu suscripción actual cubre todas las funcionalidades premium del sistema.
            </CardDescription>
          </div>
          <div className="hidden sm:flex">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-background rounded-lg p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Inicio del Ciclo</p>
            <p className="text-lg font-semibold">
              {new Date(settings.subscriptionStart).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="bg-background rounded-lg p-4 border shadow-sm">
            <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Próxima Renovación</p>
            <p className="text-lg font-semibold">
              {new Date(settings.subscriptionEnd).toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Tiempo restante en el ciclo actual</span>
            <span className="font-bold text-primary">{daysLeft} días</span>
          </div>
          
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden border">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Tu plan finaliza en aproximadamente {daysLeft} días.
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center gap-4 border border-amber-200 dark:border-amber-900">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5">
              <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Información de Renovación</h4>
              <p className="text-sm mt-1 opacity-80">
                Para renovar tu plan o realizar el pago de la suscripción, comunícate con soporte.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleWhatsAppContact}
            className="w-full sm:w-auto shrink-0 bg-[#25D366] hover:bg-[#1DA851] text-white border-transparent"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Contactar para Pagar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
