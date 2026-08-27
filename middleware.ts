import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({//Intercepción Global y Refresco de Cookies
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {//hasta aqui
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
//Verificación de Autenticación
  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();

  // 1. Si no está logueado e intenta entrar a /dashboard
  if (!user && url.pathname.startsWith('/dashboard')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }// hata aqui

  // 2. Control de accesos según el ROL del usuario
  if (user && url.pathname.startsWith('/dashboard')) {
    const rol = user.user_metadata?.rol || 'adoptante';

    // Restricción para panel de refugio
    if (url.pathname.startsWith('/dashboard/refugio') && rol !== 'refugio' && rol !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // Restricción para panel de administrador
    if (url.pathname.startsWith('/dashboard/admin') && rol !== 'admin') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};