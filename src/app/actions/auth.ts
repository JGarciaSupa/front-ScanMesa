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

    return { success: true, user: data.data.user };
  } catch (error: any) {
    console.error("Error in loginAction:", error);
    return { success: false, error: "Error de conexión con el servidor" };
  }
}

export async function refreshAction() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) return { success: false };

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    const res = await fetch(`${apiUrl}/tenant/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false };
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data.tokens;

    cookieStore.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    console.error("Error in refreshAction:", error);
    return { success: false };
  }
}

export async function getSessionServer() {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!accessToken && !refreshToken) return null;

    if (!accessToken && refreshToken) {
      const refreshResult = await refreshAction();
      if (!refreshResult.success) return null;
      // Re-get the access token after refresh
      accessToken = (await cookies()).get("accessToken")?.value;
    }

    if (!accessToken) return null;

    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const slug = await getTenantSlugServer();

    const res = await fetch(`${apiUrl}/tenant/auth/me`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "x-schema-tenant": slug,
      },
    });

    if (!res.ok) {
      // If unauthorized, try one refresh if we haven't already
      if (refreshToken && !accessToken) {
         // This logic is a bit redundant now with the check above, but good for safety
      }
      return null;
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error in getSessionServer:", error);
    return null;
  }
}
