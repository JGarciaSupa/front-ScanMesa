import React from "react";
import { Euro, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";

interface InvoiceStatsProps {
  stats: {
    totalRecaudado: number;
    totalVentas: number;
    ticketPromedio: number;
  };
}

export function InvoiceStats({ stats }: InvoiceStatsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Recaudado
          </CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.totalRecaudado)}
          </div>
          <p className="text-xs text-muted-foreground">
            Ingreso total acumulado
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalVentas}</div>
          <p className="text-xs text-muted-foreground">Ventas realizadas</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ticket Promedio
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(stats.ticketPromedio)}
          </div>
          <p className="text-xs text-muted-foreground">Promedio por venta</p>
        </CardContent>
      </Card>
    </div>
  );
}
