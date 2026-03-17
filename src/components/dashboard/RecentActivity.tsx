import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface ActivityItem {
    id: number;
    saleCode: string;
    totalAmount: number;
    issuedAt: string;
    tableName: string;
}

interface RecentActivityProps {
    recentActivity: ActivityItem[];
}

export function RecentActivity({ recentActivity }: RecentActivityProps) {
    return (
        <Card className="col-span-1 border-slate-200 shadow-sm flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Últimas Ventas</CardTitle>
                <CardDescription className="text-slate-500">
                    Últimas facturas emitidas.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="space-y-6">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between group">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold leading-none text-slate-900">{activity.tableName}</p>
                                    <p className="text-xs font-medium text-slate-500">{new Date(activity.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="font-semibold text-sm text-slate-900">{formatPrice(activity.totalAmount)}</div>
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
    );
}
