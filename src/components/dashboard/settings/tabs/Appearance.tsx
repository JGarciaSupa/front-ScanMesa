"use client";

import { Settings } from "@/app/dashboard/settings/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { useRef } from "react";

interface AppearanceProps {
  settings: Settings;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBannerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  saving: boolean;
  logoPreview: string | null;
  bannerPreview: string | null;
}

export default function Appearance({
  settings,
  handleLogoChange,
  handleBannerChange,
  handleSave,
  saving,
  logoPreview,
  bannerPreview,
}: AppearanceProps) {

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Apariencia (Marca Blanca)</CardTitle>
        <CardDescription>
          Personaliza los colores y las imágenes para que la experiencia del
          cliente refleje tu identidad visual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4 flex flex-col items-center sm:items-start gap-4">
            <Label>Logo del Local</Label>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={logoInputRef}
              onChange={handleLogoChange}
            />
            <div
              onClick={() => logoInputRef.current?.click()}
              className="relative group w-32 h-32 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {logoPreview || settings.logoUrl ? (
                <img
                  src={logoPreview || settings.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-[10px] font-medium text-center px-2">
                    Subir
                    <br />
                    Logo
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadCloud className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center sm:text-left max-w-35">
              Imagen circular, min 256x256px en formato PNG o JPG.
            </p>
          </div>

          <div className="md:col-span-8 flex flex-col gap-4">
            <Label>Banner de Portada</Label>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              ref={bannerInputRef}
              onChange={handleBannerChange}
            />
            <div
              onClick={() => bannerInputRef.current?.click()}
              className="relative group w-full h-40 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/30 overflow-hidden hover:bg-muted/50 transition-colors cursor-pointer"
            >
              {bannerPreview || settings.bannerUrl ? (
                <img
                  src={bannerPreview || settings.bannerUrl}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10 mb-3 opacity-50" />
                  <span className="text-sm font-medium">
                    Arrastra y suelta un banner aquí
                  </span>
                  <span className="text-xs opacity-70 mt-1">
                    o haz click para subir un archivo
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <UploadCloud className="w-8 h-8 text-white" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              La imagen que se verá en el login y en el menú del cliente. Tamaño
              recomendado: 1200x400px.
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/30 border-t px-6 py-4">
        <Button
          className="w-full sm:w-auto"
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Guardar Cambios
        </Button>
      </CardFooter>
    </Card>
  );
}
