"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const rolePermissions: Record<string, string[]> = {
  admin: ["/dashboard", "/kds", "/pos"],
  waiter: ["/pos"],
  kitchen: ["/kds"],
};

const defaultRoute: Record<string, string> = {
  admin: "/dashboard",
  waiter: "/pos",
  kitchen: "/kds",
};

export default function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user) {
      // Si no hay usuario, el middleware debería manejarlo, pero por seguridad:
      router.replace("/login");
      return;
    }

    const userRole = user.role.toLowerCase();
    const allowedPaths = rolePermissions[userRole] || [];
    
    // Verificar si la ruta actual está permitida para este rol
    const isAllowed = allowedPaths.some(path => pathname.startsWith(path));

    if (!isAllowed) {
      const target = defaultRoute[userRole] || "/login";
      router.replace(target);
    } else {
      setAuthorized(true);
    }
  }, [user, _hasHydrated, pathname, router]);

  if (!_hasHydrated || !authorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Verificando accesos...</p>
      </div>
    );
  }

  return <>{children}</>;
}
