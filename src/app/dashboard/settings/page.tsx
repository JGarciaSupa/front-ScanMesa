"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { Building, Palette, MapPin, CreditCard, Save, Loader2 } from "lucide-react";
import { getSettingsAction, updateSettingsAction } from "@/app/actions/settings";
import { toast } from "sonner";
import GeneralProfile from "@/components/dashboard/settings/tabs/GeneralProfile";
import Appearance from "@/components/dashboard/settings/tabs/Appearance";
import LocationAndSecurity from "@/components/dashboard/settings/tabs/LocationAndSecurity";
import Subscription from "@/components/dashboard/settings/tabs/Subscription";

export interface Settings {
  name: string;
  logoUrl: string;
  bannerUrl: string;
  currency: string;
  latitude: number;
  longitude: number;
  allowedRadiusMeters: number;
  radiusEnabled: boolean;
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
    latitude: 0,
    longitude: 0,
    allowedRadiusMeters: 0,
    radiusEnabled: false,
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
            latitude: parseFloat(data.latitude) || 0,
            longitude: parseFloat(data.longitude) || 0,
            allowedRadiusMeters: parseInt(data.allowedRadiusMeters) || 0,
            radiusEnabled: !!data.radiusEnabled,
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
      formData.append("latitude", settings.latitude?.toString() || "0");
      formData.append("longitude", settings.longitude?.toString() || "0");
      formData.append("allowedRadiusMeters", (settings.allowedRadiusMeters || 0).toString());
      formData.append("radiusEnabled", settings.radiusEnabled ? "true" : "false");
      
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
            latitude: parseFloat(data.latitude) || 0,
            longitude: parseFloat(data.longitude) || 0,
            allowedRadiusMeters: parseInt(data.allowedRadiusMeters) || 0,
            radiusEnabled: !!data.radiusEnabled,
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


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
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
            <Subscription settings={settings} />
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
}
