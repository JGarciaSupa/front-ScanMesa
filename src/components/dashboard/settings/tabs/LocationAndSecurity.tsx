"use client";

import { useState } from "react";
import { Settings } from "@/app/dashboard/settings/page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  MapPin,
  Navigation,
  Info,
  Map as MapIcon,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MapPicker = dynamic(() => import("./MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center border">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Cargando mapa...</p>
      </div>
    </div>
  ),
});

interface LocationAndSecurityProps {
  settings: Settings;
  handleChange: (field: keyof Settings, value: any) => void;
  handleSave: () => void;
  saving: boolean;
}

export default function LocationAndSecurity({
  settings,
  handleChange,
  handleSave,
  saving,
}: LocationAndSecurityProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<number | string | null>(null);
  const [showConfirmGeo, setShowConfirmGeo] = useState(false);

  const handleGetLocation = () => {

    // Check if the context is secure (HTTPS or localhost)
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGeoError("insecure_context");
      toast.error("El GPS requiere una conexión segura (HTTPS).");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("La geolocalización no es soportada por tu navegador");
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleChange("latitude", position.coords.latitude);
        handleChange("longitude", position.coords.longitude);
        setIsLocating(false);
        toast.success("Ubicación detectada correctamente");
      },
      (error) => {
        setIsLocating(false);
        setGeoError(error.code);
        console.error("Error getting location:", error);

        if (error.code === 1) {
          toast.error(
            "Permiso denegado. Por favor, habilita el GPS en tu navegador.",
          );
        } else {
          toast.error("No se pudo obtener la ubicación. Intenta de nuevo.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const hasLocation = settings.latitude !== 0 && settings.longitude !== 0;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Ubicación y Seguridad</CardTitle>
        <CardDescription>
          Configura la ubicación exacta y activa las restricciones de distancia
          para evitar pedidos falsos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="radiusEnabled" className="text-base font-medium">
              Activar Restricción de Distancia
            </Label>
            <p className="text-sm text-muted-foreground">
              Solo los usuarios dentro del radio permitido podrán realizar
              pedidos.
            </p>
          </div>
          <Switch
            id="radiusEnabled"
            checked={settings.radiusEnabled}
            onCheckedChange={(checked) =>
              handleChange("radiusEnabled", checked)
            }
          />
        </div>

        {settings.radiusEnabled && !hasLocation && (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-primary/5 gap-4 animate-in fade-in zoom-in-95 duration-300">
            <div
              className={`p-3 rounded-full ${geoError === 1 || geoError === "insecure_context" ? "bg-red-100" : "bg-primary/10"}`}
            >
              <MapPin
                className={`w-8 h-8 ${geoError === 1 || geoError === "insecure_context" ? "text-red-600" : "text-primary"}`}
              />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">
                {geoError === 1
                  ? "Permiso de GPS bloqueado"
                  : geoError === "insecure_context"
                    ? "Conexión no segura"
                    : "Se requiere tu ubicación"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {geoError === 1
                  ? "Has denegado el acceso al GPS. Habilita los permisos en tu navegador o ingresa los datos manualmente."
                  : geoError === "insecure_context"
                    ? "Tu navegador bloquea el GPS porque el sitio no usa HTTPS. Puedes ingresar las coordenadas manualmente."
                    : "Para activar esta restricción, debemos detectar la ubicación exacta de tu restaurante mediante GPS."}
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
              <Button
                onClick={() => setShowConfirmGeo(true)}
                disabled={isLocating}
                className="gap-2 w-full"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                {isLocating ? "Detectando..." : "Intentar detectar GPS"}
              </Button>

              {(geoError === 1 || geoError === "insecure_context") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Setting very small near-zero values to trigger the detail view
                    handleChange("latitude", 0.000001);
                    handleChange("longitude", 0.000001);
                    toast.info("Modo manual activado.");
                  }}
                  className="text-xs"
                >
                  Ingresar coordenadas manualmente
                </Button>
              )}
            </div>
          </div>
        )}

        {settings.radiusEnabled && hasLocation && (
          <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/10 rounded-lg text-primary">
              <MapIcon className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Mapa Interactivo</p>
                <p className="opacity-90">
                  Usa el mapa para marcar el punto exacto de tu restaurante. El
                  círculo azul representa el área permitida para pedidos.
                </p>
              </div>
            </div>

            <MapPicker
              lat={settings.latitude}
              lng={settings.longitude}
              radius={settings.allowedRadiusMeters}
              onChange={(lat, lng) => {
                handleChange("latitude", lat);
                handleChange("longitude", lng);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="latitude"
                  className="text-xs text-muted-foreground uppercase tracking-wider"
                >
                  Latitud
                </Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={settings.latitude}
                  className="bg-muted/30"
                  disabled
                  onChange={(e) =>
                    handleChange("latitude", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="longitude"
                  className="text-xs text-muted-foreground uppercase tracking-wider"
                >
                  Longitud
                </Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={settings.longitude}
                  className="bg-muted/30"
                  disabled
                  onChange={(e) =>
                    handleChange("longitude", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="radius"
                  className="text-xs text-muted-foreground uppercase tracking-wider font-bold"
                >
                  Radio (metros)
                </Label>
                <div className="relative">
                  <Input
                    id="radius"
                    type="number"
                    value={settings.allowedRadiusMeters}
                    onChange={(e) =>
                      handleChange(
                        "allowedRadiusMeters",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="pr-16 border-primary/50 focus:ring-primary h-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-xs font-medium">
                    metros
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-muted-foreground italic">
                * Recomendado: 30-50m. El GPS móvil puede variar.
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmGeo(true)}
                disabled={isLocating}
                className="text-xs gap-2 hover:bg-primary/5"
              >
                {isLocating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Navigation className="w-3 h-3" />
                )}
                Recalibrar con GPS
              </Button>
            </div>
          </div>
        )}
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

      <AlertDialog open={showConfirmGeo} onOpenChange={setShowConfirmGeo}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <AlertDialogTitle>¿Recalibrar ubicación?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Esta acción detectará la ubicación actual de tu dispositivo y{" "}
              <strong>reemplazará</strong> las coordenadas actuales del
              restaurante. El marcador en el mapa se moverá a donde te
              encuentres ahora mismo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmGeo(false);
                handleGetLocation();
              }}
              className="bg-primary hover:bg-primary/90"
            >
              Sí, usar mi ubicación actual
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
