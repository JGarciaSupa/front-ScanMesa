"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { saveStaffAction } from "@/app/actions/staff";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Lock, Loader2, Save, Undo } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await saveStaffAction(payload, user.id);

      if (res.success) {
        toast.success("Perfil actualizado correctamente");
        // Update local store
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
        });
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      } else {
        toast.error(res.error || "Error al actualizar el perfil");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mi Perfil</h1>
          <p className="text-slate-500 mt-1">
            Gestiona tu información personal y configuración de cuenta.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <Undo className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="grid gap-8">
        {/* Avatar Section */}
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800" />
          <CardContent className="relative pt-0 flex flex-col items-center">
            <div className="-mt-16 ring-4 ring-white rounded-full bg-white">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                />
                <AvatarFallback className="bg-slate-900 text-white text-2xl font-bold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-2xl font-bold text-slate-900">{user.name}</h2>
              <p className="text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-sm font-medium mt-1 inline-block capitalize">
                {user.role}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu nombre y dirección de correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Cambiar Contraseña</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">Dejar en blanco para no cambiar</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-4">
              <Button type="submit" className="ml-auto" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
