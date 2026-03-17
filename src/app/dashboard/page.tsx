"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LoadingState } from "@/components/dashboard/LoadingState";

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
    return <LoadingState />;
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
      <DashboardHeader userName={user?.name} currentDate={currentDate} />

      <StatsCards 
        totalSales={displayStats.totalSales}
        occupiedTables={displayStats.occupiedTables}
        totalTables={displayStats.totalTables}
        completedOrders={displayStats.completedOrders}
        topProduct={displayStats.topProduct}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SalesChart salesByHour={displayStats.salesByHour} />
        <RecentActivity recentActivity={displayStats.recentActivity} />
      </div>
    </div>
  );
}
