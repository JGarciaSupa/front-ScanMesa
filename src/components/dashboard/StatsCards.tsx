import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Euro, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface StatsCardsProps {
  totalSales: number;
  occupiedTables: number;
  totalTables: number;
  completedOrders: number;
  topProduct: { name: string; quantity: number };
}

export function StatsCards({
  totalSales,
  occupiedTables,
  totalTables,
  completedOrders,
  topProduct,
}: StatsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Ingresos Totales (Hoy)
          </CardTitle>
          <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
            <Euro className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {formatPrice(totalSales)}
          </div>
          <p className="text-sm text-slate-500 mt-1">Ventas del día actual</p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Mesas Activas
          </CardTitle>
          <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {occupiedTables}{" "}
            <span className="text-xl text-slate-400 font-medium">
              / {totalTables}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {totalTables > 0
              ? `${((occupiedTables / totalTables) * 100).toFixed(0)}% de ocupación`
              : "No hay mesas registradas"}
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Pedidos Servidos (Hoy)
          </CardTitle>
          <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-4 w-4 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {completedOrders}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Total de platos servidos hoy
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600">
            Plato Estrella
          </CardTitle>
          <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="text-2xl font-bold text-slate-900 truncate"
            title={topProduct.name}
          >
            {topProduct.name}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {topProduct.quantity} unidades vendidas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
