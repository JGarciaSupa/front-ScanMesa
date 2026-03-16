"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { useState } from "react";

export default function ButtonWaiterdCalled({ tableId }: { tableId: number }) {

  const [waiterCalled, setWaiterCalled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const getTenantSlug = () => {
    const host = window.location.hostname;
    const subDomain = host.split('.')[0] ?? "";
    return subDomain.replace('-', '_');
  };

  const handleCallWaiter = async () => {
    if (waiterCalled || isLoading) return;

    setIsLoading(true);
    try {
      const tenantSlug = getTenantSlug();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tenant/orders/waiter-call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-schema-tenant': tenantSlug 
        },
        body: JSON.stringify({
          tableId,
          reason: "Llamada desde menú QR"
        })
      });
      const result = await response.json();
      if (result.success) {
        setWaiterCalled(true);
        // Reset after 2 minutes or similar, but for now just keep it true
        setTimeout(() => setWaiterCalled(false), 60000);
      }
    } catch (error) {
      console.error("Error calling waiter:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={isLoading}
      onClick={handleCallWaiter}
      className={cn(
        "h-9 px-4 text-xs font-semibold rounded-full border-0 transition-all duration-300",
        waiterCalled
          ? "bg-emerald-500 text-white hover:bg-emerald-500 scale-95"
          : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
      )}
    >
      <Bell className="w-3.5 h-3.5 mr-1.5" />
      {waiterCalled ? "¡En camino!" : isLoading ? "Llamando..." : "Llamar Camarero"}
    </Button>
  );
}