"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "12:00", sales: 120 },
  { time: "13:00", sales: 250 },
  { time: "14:00", sales: 300 },
  { time: "15:00", sales: 180 },
  { time: "16:00", sales: 90 },
  { time: "17:00", sales: 150 },
  { time: "18:00", sales: 200 },
  { time: "19:00", sales: 400 },
  { time: "20:00", sales: 500 },
  { time: "21:00", sales: 450 },
  { time: "22:00", sales: 200 },
];

const recentOrders = [
  { id: "1", table: "Mesa 4", status: "Pagado", amount: "€45.00", time: "Hace 5 min" },
  { id: "2", table: "Mesa 2", status: "En curso", amount: "€12.00", time: "Hace 10 min" },
  { id: "3", table: "Mesa 7", status: "Pagado", amount: "€89.50", time: "Hace 15 min" },
  { id: "4", table: "Mesa 1", status: "En curso", amount: "€25.00", time: "Hace 20 min" },
  { id: "5", table: "Mesa 5", status: "En curso", amount: "€54.00", time: "Hace 32 min" },
];

import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const currentDate = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Saludo */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {user ? `¡Hola, ${user.name}! 👋` : 'Resumen de Hoy'}
          </h2>
          <p className="text-sm font-medium text-slate-500 capitalize mt-1">
            {user ? "Aquí tienes un resumen de lo que sucede hoy." : currentDate}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Ingresos Totales</CardTitle>
            <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">€ 1,250.00</div>
            <p className="text-sm text-slate-500 mt-1">
              <span className="text-emerald-600 font-semibold flex items-center inline-flex">
                <TrendingUp className="h-3 w-3 mr-1" />+15%
              </span> vs ayer
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
            <div className="text-3xl font-bold text-slate-900">8 <span className="text-xl text-slate-400 font-medium">/ 15</span></div>
            <p className="text-sm text-slate-500 mt-1">53% de ocupación</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600">Pedidos Completados</CardTitle>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">42</div>
            <p className="text-sm text-slate-500 mt-1">+8% vs ayer a esta hora</p>
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
            <div className="text-2xl font-bold text-slate-900 truncate" title="Pizza Margarita">Pizza Margarita</div>
            <p className="text-sm text-slate-500 mt-1">18 porciones vendidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Sección Inferior */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Gráfico (Ocupa 2/3 en Desktop) */}
        <Card className="col-span-1 lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Ventas por Hora</CardTitle>
            <CardDescription className="text-slate-500">
              Resumen de ingresos desde la apertura (12:00) hasta el cierre.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[320px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

        {/* Actividad Reciente (Ocupa 1/3 en Desktop) */}
        <Card className="col-span-1 border-slate-200 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Actividad Reciente</CardTitle>
            <CardDescription className="text-slate-500">
              Últimos pedidos gestionados.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-6">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between group">
                  <div className="space-y-1">
                    <p className="text-sm font-bold leading-none text-slate-900">{order.table}</p>
                    <p className="text-xs font-medium text-slate-500">{order.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-sm text-slate-900">{order.amount}</div>
                    <Badge variant={order.status === "Pagado" ? "default" : "secondary"} className={
                      order.status === "Pagado" 
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none font-semibold px-2.5 py-0.5" 
                        : "bg-amber-100 text-amber-700 hover:bg-amber-200 border-none font-semibold px-2.5 py-0.5"
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
