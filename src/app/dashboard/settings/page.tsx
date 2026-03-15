"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Building, Palette, MapPin, CreditCard, Save, MessageCircle, Loader2 } from "lucide-react";
import { getSettingsAction, updateSettingsAction } from "@/app/actions/settings";
import { toast } from "sonner";
import GeneralProfile from '../../../components/dashboard/settings/tabs/GeneralProfile';
import Appearance from "@/components/dashboard/settings/tabs/Appearance";
import LocationAndSecurity from "@/components/dashboard/settings/tabs/LocationAndSecurity";

export interface Settings {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  currency: string;
  defaultTaxRate: number;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  subscriptionStart: string;
  subscriptionEnd: string;
}

import { useConfigStore } from "@/store/useConfigStore";

export default function SettingsPage() {
  const updateConfig = useConfigStore((state) => state.updateLocally);
  const [settings, setSettings] = useState({
    name: "",
    logoUrl: "",
    bannerUrl: "",
    currency: "",
    defaultTaxRate: 0,
    latitude: 0,
    longitude: 0,
    allowedRadiusMeters: 0,
    subscriptionStart: new Date().toISOString(),
    subscriptionEnd: new Date().toISOString(),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States for image previews and files
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getSettingsAction();
        if (res.success && res.data) {
          const data = res.data;
          setSettings({
            ...data,
            defaultTaxRate: parseFloat(data.defaultTaxRate) || 0,
            latitude: parseFloat(data.latitude) || 0,
            longitude: parseFloat(data.longitude) || 0,
            allowedRadiusMeters: parseInt(data.allowedRadiusMeters) || 0,
          });
        } else {
          toast.error(res.error || "Error al cargar configuración");
        }
      } catch (error) {
        toast.error("Error de conexión");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (field: string, value: string | number | boolean | null) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const formData = new FormData();
      formData.append("name", settings.name);
      formData.append("currency", settings.currency);
      formData.append("defaultTaxRate", settings.defaultTaxRate?.toString() || "0");
      formData.append("latitude", settings.latitude?.toString() || "0");
      formData.append("longitude", settings.longitude?.toString() || "0");
      formData.append("allowedRadiusMeters", (settings.allowedRadiusMeters || 0).toString());
      
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      
      if (bannerFile) {
        formData.append("banner", bannerFile);
      }

      const res = await updateSettingsAction(formData);
      
      if (res.success) {
        toast.success("Configuración actualizada correctamente");
        if (res.data) {
          const data = res.data;
          setSettings({
            ...data,
            defaultTaxRate: parseFloat(data.defaultTaxRate) || 0,
            latitude: parseFloat(data.latitude) || 0,
            longitude: parseFloat(data.longitude) || 0,
            allowedRadiusMeters: parseInt(data.allowedRadiusMeters) || 0,
          });
          
          // Actualizar store global
          updateConfig({
            name: data.name,
            logoUrl: data.logoUrl,
            bannerUrl: data.bannerUrl
          });

          // Clear files/previews
          setLogoFile(null);
          setBannerFile(null);
          setLogoPreview(null);
          setBannerPreview(null);
        }
      } else {
        toast.error(res.error || "Error al guardar cambios");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

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
    const currentUrl = window.location.origin;
    
    const message = `Hola, deseo pagar la suscripción desde esta web: ${currentUrl}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Restaurante</h1>
          <p className="text-muted-foreground mt-1">
            Administra la información general, apariencia, ubicación y suscripción.
          </p>
        </div>
        <Button 
          className="gap-2 shadow-sm shrink-0" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full mt-2">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50">
          <TabsTrigger value="general" className="gap-2 py-2.5 data-[state=active]:shadow-sm text-sm">
            <Building className="w-4 h-4" />
            <span className="hidden sm:inline">Perfil General</span>
            <span className="sm:hidden">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2 py-2.5 data-[state=active]:shadow-sm text-sm">
            <Palette className="w-4 h-4" />
            <span>Apariencia</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="gap-2 py-2.5 data-[state=active]:shadow-sm text-sm">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Ubicación y Seguridad</span>
            <span className="sm:hidden">Ubicación</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2 py-2.5 data-[state=active]:shadow-sm text-sm">
            <CreditCard className="w-4 h-4" />
            <span>Suscripción</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* TAB 1: PERFIL GENERAL */}
          <TabsContent value="general" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <GeneralProfile 
              settings={settings}
              handleChange={handleChange}
              handleSave={handleSave}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 2: APARIENCIA */}
          <TabsContent value="appearance" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <Appearance
              settings={settings}
              handleLogoChange={handleLogoChange}
              handleBannerChange={handleBannerChange}
              handleSave={handleSave}
              saving={saving}
              logoPreview={logoPreview}
              bannerPreview={bannerPreview}
            />
          </TabsContent>

          {/* TAB 3: UBICACIÓN Y SEGURIDAD */}
          <TabsContent value="location" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <LocationAndSecurity
              settings={settings}
              handleChange={handleChange}
              handleSave={handleSave}
              saving={saving}
            />
          </TabsContent>

          {/* TAB 4: PLAN Y SUSCRIPCIÓN */}
          <TabsContent value="plan" className="m-0 focus-visible:outline-none focus-visible:ring-0">
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
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
