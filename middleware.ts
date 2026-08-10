import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Aquí puedes manejar la lógica de redirección o control de sesiones en el futuro
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto archivos estáticos, imágenes, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
