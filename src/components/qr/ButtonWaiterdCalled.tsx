"use client";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { useState } from "react";

export default function ButtonWaiterdCalled() {

  const [waiterCalled, setWaiterCalled] = useState<boolean>(false);

  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn(
        "h-9 px-4 text-xs font-semibold rounded-full border-0 transition-all duration-300",
        waiterCalled
          ? "bg-emerald-500 text-white hover:bg-emerald-500 scale-95"
          : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
      )}
    >
      <Bell className="w-3.5 h-3.5 mr-1.5" />
      {waiterCalled ? "¡En camino! 🛎" : "Llamar Mozo"}
    </Button>
  );
}