import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas protegidas que requieren autenticación
const protectedPaths = ['/dashboard', '/kds', '/pos'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si la ruta actual está en la lista de rutas protegidas
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // Si la ruta es protegida, validamos la existencia del accessToken
  if (isProtectedPath) {
    const accessToken = request.cookies.get('accessToken');

    if (!accessToken) {
      // Si no hay token, lo redirigimos a la página de inicio de sesión
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Permitir la solicitud si todo está bien
  return NextResponse.next();
}

// Configuración de rutas donde debe ejecutarse este middleware
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kds/:path*',
    '/pos/:path*'
  ]
};
