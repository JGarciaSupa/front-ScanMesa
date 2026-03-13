"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  LayoutGrid,
  Users,
  Receipt,
  Settings,
  Store,
  LogOut,
  Menu,
  Tags
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const navigation = [
  { name: "Inicio", href: "/dashboard", icon: Home },
  { name: "Menú", href: "/dashboard/menu", icon: BookOpen },
  { name: "Categorías", href: "/dashboard/categories", icon: Tags },
  { name: "Mesas", href: "/dashboard/tables", icon: LayoutGrid },
  { name: "Personal", href: "/dashboard/staff", icon: Users },
  { name: "Facturación", href: "/dashboard/invoices", icon: Receipt },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings },
];

import { logoutAction } from "@/app/actions/logout";
import { useAuthStore } from "@/store/useAuthStore";

function SidebarContent() {
  const pathname = usePathname();
  const logoutStore = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    logoutStore();
    await logoutAction();
  };

  return (
    <div className="flex h-full flex-col bg-slate-900 border-r border-slate-800 text-slate-300">
      {/* Header Sidebar */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4 gap-3 bg-slate-950/50">
        <Avatar className="h-9 w-9 border border-slate-700">
          <AvatarImage src="https://api.dicebear.com/7.x/shapes/svg?seed=Osteria&backgroundColor=0f172a" alt="Osteria Venezia" />
          <AvatarFallback className="bg-slate-800 text-slate-100">OV</AvatarFallback>
        </Avatar>
        <span className="font-bold text-lg text-white tracking-tight">Osteria Venezia</span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Sidebar */}
      <div className="border-t border-slate-800 p-4 space-y-3 bg-slate-900/50">
        <Button variant="outline" className="w-full justify-start text-slate-200 border-slate-700 hover:bg-slate-800 hover:text-white bg-transparent">
          <Store className="mr-2 h-4 w-4" />
          Ir al POS (Sala)
        </Button>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}

import RoleGuard from "@/components/auth/RoleGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard>
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <SidebarContent />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between gap-x-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-m-2 p-2 text-slate-700 lg:hidden hover:bg-slate-100">
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72 border-r-slate-800">
                  <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                  <SidebarContent />
                </SheetContent>
              </Sheet>

              {/* Separator for mobile */}
              <div className="h-6 w-px bg-slate-200 lg:hidden" aria-hidden="true" />

              {/* Breadcrumbs */}
              <Breadcrumb className="hidden sm:flex">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard" className="text-slate-500 hover:text-slate-900">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-semibold text-slate-900">Inicio</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden sm:block">
                <Select defaultValue="today">
                  <SelectTrigger className="w-[150px] h-9 bg-slate-50 border-slate-200 focus:ring-slate-400">
                    <SelectValue placeholder="Periodo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hoy</SelectItem>
                    <SelectItem value="week">Esta Semana</SelectItem>
                    <SelectItem value="month">Este Mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Separator */}
              <div className="hidden sm:block h-6 w-px bg-slate-200" aria-hidden="true" />

              {/* Profile */}
              <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-slate-200 transition-all">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminBoss" alt="Admin Avatar" />
                <AvatarFallback className="bg-slate-900 text-white text-xs font-medium">AD</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
