"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ShoppingBag, TrendingUp, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuthStore } from "@/store/useAuthStore";

interface DashboardStats {
  totalSales: number;
  occupiedTables: number;
  totalTables: number;
  completedOrders: number;
  topProduct: { name: string; quantity: number };
  salesByHour: Array<{ time: string; sales: number }>;
  recentActivity: Array<{
    id: number;
    saleCode: string;
    totalAmount: number;
    issuedAt: string;
    tableName: string;
  }>;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const hostname = window.location.hostname;
        const subDomain = hostname.split('.')[0] || "";
        const slug = subDomain.replace(/-/g, '_');
        
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${apiBaseUrl}/tenant/dashboard/stats`, {
            headers: {
                'x-schema-tenant': slug
            }
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStats(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-[400px] items-center justify-center gap-4 animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
        <p className="text-slate-400 font-medium">Cargando estadísticas...</p>
      </div>
    );
  }

  const displayStats = stats || {
    totalSales: 0,
    occupiedTables: 0,
    totalTables: 0,
    completedOrders: 0,
    topProduct: { name: 'N/A', quantity: 0 },
    salesByHour: [],
    recentActivity: []
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Saludo */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {user ? `¡Hola, ${user.name}! 👋` : 'Resumen de Hoy'}
          </h2>
          <p className="text-sm font-medium text-slate-500 capitalize mt-1">
            {currentDate}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Ingresos Totales (Hoy)</CardTitle>
            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">€ {displayStats.totalSales.toFixed(2)}</div>
            <p className="text-sm text-slate-500 mt-1">
              Ventas del día actual
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Mesas Activas</CardTitle>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{displayStats.occupiedTables} <span className="text-xl text-slate-400 font-medium">/ {displayStats.totalTables}</span></div>
            <p className="text-sm text-slate-500 mt-1">
              {displayStats.totalTables > 0 
                ? `${((displayStats.occupiedTables / displayStats.totalTables) * 100).toFixed(0)}% de ocupación` 
                : "No hay mesas registradas"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Pedidos Servidos (Hoy)</CardTitle>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{displayStats.completedOrders}</div>
            <p className="text-sm text-slate-500 mt-1">Total de platos servidos hoy</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Plato Estrella</CardTitle>
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 truncate" title={displayStats.topProduct.name}>
                {displayStats.topProduct.name}
            </div>
            <p className="text-sm text-slate-500 mt-1">{displayStats.topProduct.quantity} unidades vendidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección Inferior */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Gráfico */}
        <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Ventas por Hora</CardTitle>
            <CardDescription className="text-slate-500">
              Resumen de ingresos generados hoy.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height={320} minWidth={0} minHeight={0}>
                <BarChart data={displayStats.salesByHour.length > 0 ? displayStats.salesByHour : [{time: '00:00', sales: 0}]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={12} 
                    fontSize={12} 
                    stroke="#64748b"
                    fontWeight={500}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tickMargin={12} 
                    fontSize={12} 
                    stroke="#64748b"
                    tickFormatter={(value) => `€${value}`}
                    fontWeight={500}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600, color: '#0f172a' }}
                    formatter={(value) => [`€${value}`, 'Ingresos']}
                  />
                  <Bar 
                    dataKey="sales" 
                    fill="#0f172a" 
                    radius={[6, 6, 0, 0]} 
                    activeBar={{ fill: '#334155' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card className="col-span-1 border-slate-200 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Últimas Ventas</CardTitle>
            <CardDescription className="text-slate-500">
              Últimas facturas emitidas.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {displayStats.recentActivity.length > 0 ? (
                displayStats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between group">
                      <div className="space-y-1">
                        <p className="text-sm font-bold leading-none text-slate-900">{activity.tableName}</p>
                        <p className="text-xs font-medium text-slate-500">{new Date(activity.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-sm text-slate-900">€{activity.totalAmount.toFixed(2)}</div>
                        <Badge variant="default" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-semibold px-2.5 py-0.5">
                          {activity.saleCode}
                        </Badge>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No hay actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
