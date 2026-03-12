"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Building, Palette, MapPin, CreditCard, Save, Image as ImageIcon, MessageCircle } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: "Mamá Neme",
    logoUrl: "",
    bannerUrl: "",
    currency: "PEN",
    defaultTaxRate: 18,
    latitude: -12.046374,
    longitude: -77.042793,
    allowedRadiusMeters: 50,
    subscriptionStart: "2024-01-01T00:00:00Z",
    subscriptionEnd: "2024-12-31T23:59:59Z",
  });

  const handleChange = (field: string, value: string | number | boolean | null) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // Calcular días restantes de suscripción (mock)
  const calculateDaysLeft = () => {
    const end = new Date(settings.subscriptionEnd);
    const now = new Date(); // Asumiremos una fecha actual para la demostración
    const diffTime = Math.abs(end.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft();
  const progressPercentage = Math.min(100, Math.max(0, (daysLeft / 365) * 100)); // Asumiendo plan anual


  const handleWhatsAppContact = () => {
    const phoneNumber = "5193469928"; // Adding assumed country code for Peru (51), modify if different. Using 93469928 directly.
    const message = `Hola, deseo pagar la suscripción de mi restaurante: ${settings.name}.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Restaurante</h1>
          <p className="text-muted-foreground mt-1">
            Administra la información general, apariencia, ubicación y suscripción.
          </p>
        </div>
        <Button className="gap-2 shadow-sm shrink-0">
          <Save className="w-4 h-4" />
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full mt-2">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="general" className="gap-2 py-2.5 data-[state=active]:shadow-sm">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil General</span>
            <span className="sm:hidden">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 py-2.5 data-[state=active]:shadow-sm">
            <Palette className="w-4 h-4" />
            <span>Apariencia</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2 py-2.5 data-[state=active]:shadow-sm">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Ubicación y Seguridad</span>
            <span className="sm:hidden">Ubicación</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2 py-2.5 data-[state=active]:shadow-sm">
            <CreditCard className="w-4 h-4" />
            <span>Suscripción</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* TAB 1: PERFIL GENERAL */}
          <TabsContent value="general" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Perfil General</CardTitle>
                <CardDescription>
                  Actualiza la información básica de tu restaurante que verán tus clientes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Restaurante</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Ej. Mi Restaurante"
                  />
                  <p className="text-xs text-muted-foreground mr-1">Este nombre aparecerá en la aplicación web del cliente.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={settings.currency} onValueChange={(val) => handleChange("currency", val)}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Selecciona una moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PEN">Soles (PEN)</SelectItem>
                        <SelectItem value="USD">Dólares (USD)</SelectItem>
                        <SelectItem value="EUR">Euros (EUR)</SelectItem>
                        <SelectItem value="MXN">Pesos (MXN)</SelectItem>
                        <SelectItem value="COP">Pesos (COP)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Moneda utilizada para precios y pagos.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tasa de Impuesto Predeterminada (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={settings.defaultTaxRate}
                      onChange={(e) => handleChange("defaultTaxRate", parseFloat(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Porcentaje de impuesto a aplicar por defecto (Ej: 18 para IGV/IVA).</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t px-6 py-4">
                <Button className="w-full sm:w-auto">Guardar Cambios</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 2: APARIENCIA */}
          <TabsContent value="appearance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Apariencia (Marca Blanca)</CardTitle>
                <CardDescription>
                  Personaliza los colores y las imágenes para que la experiencia del cliente refleje tu identidad visual.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-4 flex flex-col items-center sm:items-start gap-4">
                    <Label>Logo del Local</Label>
                    <div className="relative group w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer">
                      {settings.logoUrl ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-[10px] font-medium text-center px-2">Subir<br/>Logo</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloud className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center sm:text-left max-w-[140px]">
                      Imagen circular, min 256x256px en formato PNG o JPG.
                    </p>
                  </div>

                  <div className="md:col-span-8 flex flex-col gap-4">
                    <Label>Banner de Portada</Label>
                    <div className="relative group w-full h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer">
                       {settings.bannerUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={settings.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                       ) : (
                         <div className="flex flex-col items-center text-muted-foreground">
                           <ImageIcon className="w-10 h-10 mb-3 opacity-50" />
                           <span className="text-sm font-medium">Arrastra y suelta un banner aquí</span>
                           <span className="text-xs opacity-70 mt-1">o haz click para subir un archivo</span>
                         </div>
                       )}
                       <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <UploadCloud className="w-8 h-8 text-white" />
                       </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      La imagen que se verá en el login y en el menú del cliente. Tamaño recomendado: 1200x400px.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: UBICACIÓN Y SEGURIDAD */}
          <TabsContent value="location" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Ubicación y Seguridad</CardTitle>
                <CardDescription>
                  Configura la ubicación exacta y activa las restricciones de distancia para evitar pedidos falsos o de personas que no están en el local.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitud</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={settings.latitude}
                      onChange={(e) => handleChange("latitude", parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitud</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={settings.longitude}
                      onChange={(e) => handleChange("longitude", parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50 space-y-6">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/10">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold">Geofencing (Restricción por distancia)</Label>
                      <p className="text-sm text-muted-foreground mr-4">
                        Solo permite realizar pedidos dentro de un radio específico del local (mediante GPS). Evita que la gente escanee el QR, se lleve una foto a casa y luego pida comida.
                      </p>
                    </div>
                    <Switch
                     checked={settings.allowedRadiusMeters !== null && settings.allowedRadiusMeters > 0}
                     onCheckedChange={(val) => handleChange("allowedRadiusMeters", val ? 50 : 0)}
                    />
                  </div>

                  {(settings.allowedRadiusMeters !== null && settings.allowedRadiusMeters > 0) && (
                    <div className="space-y-2 max-w-sm flex-1 animate-in slide-in-from-top-2 fade-in duration-200">
                      <Label htmlFor="radius">Radio Permitido (metros)</Label>
                      <div className="relative">
                        <Input
                          id="radius"
                          type="number"
                          value={settings.allowedRadiusMeters}
                          onChange={(e) => handleChange("allowedRadiusMeters", parseInt(e.target.value) || 0)}
                          className="pr-16"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">
                          metros
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Recomendado: 30 a 50 metros. Considera la precisión del GPS de los móviles.
                      </p>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: PLAN Y SUSCRIPCIÓN */}
          <TabsContent value="plan" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Card className="shadow-sm border-primary/20 bg-gradient-to-br from-card to-primary/[0.02]">
              <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Plan Pro
                      <Badge variant="default" className="text-xs ml-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-transparent">Activo</Badge>
                    </CardTitle>
                    <CardDescription className="mt-2 text-base">
                      Tu suscripción actual cubre todas las funcionalidades premium del sistema de pedidos QR.
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
                    <p className="text-lg font-semibold">{new Date(settings.subscriptionStart).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border shadow-sm">
                    <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Próxima Renovación</p>
                    <p className="text-lg font-semibold">{new Date(settings.subscriptionEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Tiempo restante en el ciclo actual</span>
                    <span className="font-bold text-primary">{daysLeft} días</span>
                  </div>
                  
                  {/* Custom Progress Bar since we don't know if progress.tsx exists */}
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
                           Para renovar tu plan o realizar el pago de la suscripción, comunícate directamente con nuestro equipo de soporte.
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
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
