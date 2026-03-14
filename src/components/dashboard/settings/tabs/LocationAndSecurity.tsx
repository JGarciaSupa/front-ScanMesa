"use client";

import { Settings } from "@/app/dashboard/settings/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

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
  saving
}: LocationAndSecurityProps) {

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitud</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              value={settings.latitude}
              onChange={(e) =>
                handleChange("latitude", parseFloat(e.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitud</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              value={settings.longitude}
              onChange={(e) =>
                handleChange("longitude", parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="space-y-2 max-w-sm flex-1 animate-in slide-in-from-top-2 fade-in duration-200">
          <Label htmlFor="radius">Radio Permitido (metros)</Label>
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
              className="pr-16"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">
              metros
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Recomendado: 30 a 50 metros. Considera la precisión del GPS de
            los móviles.
          </p>
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
