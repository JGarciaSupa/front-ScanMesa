import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas protegidas que requieren autenticación
const protectedPaths = ['/dashboard', '/kds', '/pos'];

async function refreshTokens(request: NextRequest, refreshToken: string) {
  const host = request.headers.get("host") ?? "";
  const subDomain = host.split('.')[0] ?? "";
  const slug = subDomain.replace('-', '_');
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${apiUrl}/tenant/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-schema-tenant": slug
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) return data.data.tokens;
    }
  } catch (e) {
    console.error("Middleware refresh error:", e);
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');

  // Si es la página de login
  if (pathname === '/login') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si no hay access token pero hay refresh token, intentar renovar y entrar
    if (refreshToken) {
      const tokens = await refreshTokens(request, refreshToken.value);
      if (tokens) {
        const response = NextResponse.redirect(new URL('/dashboard', request.url));

        response.cookies.set("accessToken", tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60,
          path: "/",
        });

        response.cookies.set("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });

        return response;
      }
    }
  }

  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Lógica de renovación de tokens si el access token expiró pero hay refresh token
  if (isProtectedPath && !accessToken && refreshToken) {
    const tokens = await refreshTokens(request, refreshToken.value);

    if (tokens) {
      const response = NextResponse.next();

      response.cookies.set("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
      });

      response.cookies.set("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }
  }

  // Si la ruta es protegida y no hay forma de autenticar, al login
  if (isProtectedPath && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configuración de rutas donde debe ejecutarse este middleware
export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/kds/:path*',
    '/pos/:path*'
  ]
};
