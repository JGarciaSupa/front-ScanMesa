import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { formatPrice } from "@/lib/utils";

interface SalesChartProps {
    salesByHour: Array<{ time: string; sales: number }>;
}

export function SalesChart({ salesByHour }: SalesChartProps) {
    const data = salesByHour.length > 0 ? salesByHour : [{ time: '00:00', sales: 0 }];

    return (
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
                                tickFormatter={(value) => formatPrice(value)}
                                fontWeight={500}
                            />
                            <Tooltip
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600, color: '#0f172a' }}
                                formatter={(value) => [formatPrice(Number(value)), 'Ingresos']}
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
    );
}
