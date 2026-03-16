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

/**
 * Lógica de validación de Tenant (Subdominio)
 */
async function validateTenant(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Extraer el subdominio
  const hostParts = hostname.split('.');
  let subdomain = '';

  if (hostParts.length > 1) {
    if (hostParts.length === 2 && hostParts[1].startsWith('localhost')) {
      subdomain = hostParts[0];
    } else if (hostParts.length >= 3 || (hostParts.length === 2 && !hostParts[1].startsWith('localhost'))) {
      subdomain = hostParts[0];
    }
  }

  // Ignorar subdominios reservados o si no hay subdominio
  const reservedSubdomains = ['www', 'admin', 'api', 'dashboard', 'localhost'];
  if (!subdomain || reservedSubdomains.includes(subdomain.toLowerCase())) {
    return { shouldRedirect: false };
  }

  // Normalizar el slug
  const tenantSlug = subdomain.replace(/-/g, '_').toLowerCase();

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${apiBaseUrl}/tenant/auth/validate-tenant/${tenantSlug}`, {
      next: { revalidate: 300 }
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.exists) {
        return { shouldRedirect: true };
      }
    }
  } catch (error) {
    console.error(`[Proxy] Error validando tenant ${tenantSlug}:`, error);
  }

  return { shouldRedirect: false };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Validar existencia del Tenant/Subdominio
  // Omitimos archivos estáticos y API interna de Next
  const isInternal = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.') || pathname === '/favicon.ico';
  
  if (!isInternal) {
    const { shouldRedirect } = await validateTenant(request);
    if (shouldRedirect) {
      return NextResponse.redirect('https://www.google.com');
    }
  }

  // 2. Lógica de Autenticación (Tokens)
  const accessToken = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');

  // Si es la página de login
  if (pathname === '/login') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

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

  // Renovación de tokens para rutas protegidas
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

  // Redirigir al login si no está autenticado
  if (isProtectedPath && !accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configuración de rutas
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};
