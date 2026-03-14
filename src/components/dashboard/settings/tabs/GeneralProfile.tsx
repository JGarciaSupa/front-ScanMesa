"use client";

import { Settings } from "@/app/dashboard/settings/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface GeneralProfileProps {
  settings: Settings;
  handleChange: (field: keyof Settings, value: string | number) => void;
  handleSave: () => void;
  saving: boolean;
}

export default function GeneralProfile({
  settings,
  handleChange,
  handleSave,
  saving
}: GeneralProfileProps) {

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Perfil General</CardTitle>
        <CardDescription>
          Actualiza la información básica de tu restaurante que verán tus
          clientes.
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
          <p className="text-xs text-muted-foreground">
            Este nombre aparecerá en la aplicación web del cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Moneda</Label>
            <Select
              value={settings.currency || ""}
              onValueChange={(val) => handleChange("currency", val)}
            >
              <SelectTrigger id="currency" className="w-full">
                <SelectValue placeholder="Selecciona una moneda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">Euros (EUR)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Moneda utilizada para precios y pagos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">Tasa de Impuesto Predeterminada (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={settings.defaultTaxRate}
              onChange={(e) =>
                handleChange("defaultTaxRate", parseFloat(e.target.value) || 0)
              }
            />
            <p className="text-xs text-muted-foreground">
              Porcentaje de impuesto a aplicar por defecto.
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
