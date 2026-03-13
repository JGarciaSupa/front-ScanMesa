"use server";

import { cookies } from "next/headers";
import getTenantSlugServer from "@/utils/getTenantSlugServer";

export async function loginAction(email: string, password: string) {
  try {
    const slug = await getTenantSlugServer();
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${apiUrl}/tenant/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-schema-tenant": slug,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: data.error || "Error al iniciar sesión" };
    }

    // Guardar tokens en cookies (HTTP Only via Next.js cookies)
    const { accessToken, refreshToken } = data.data.tokens;
    
    const cookieStore = await cookies();
    
    // El access token dura 15 mins (900 segs)
    cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 mins
      path: "/",
    });

    // El refresh token dura 7 días
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in loginAction:", error);
    return { success: false, error: "Error de conexión con el servidor" };
  }
}
