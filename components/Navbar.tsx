"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  // Ocultar el Navbar en el portal de login admin y login normal
  if (
    pathname?.startsWith("/admin") || 
    pathname?.startsWith("/dashboard") || 
    pathname === "/loginadmin" || 
    pathname === "/login"
  ) {
    return null;
  }

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
        <span>🐾</span>
        <span>
          Patitas <span className="text-[#f4c430]">al Hogar</span>
        </span>
      </Link>

      {/* Menú de Navegación */}
      <nav className="flex items-center gap-6">
        
        <Link href="/perros" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          Perros
        </Link>

        {/* Botón Acceso Panel Admin */}
        <Link
          href="/loginadmin"
          className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-gray-900 font-semibold px-3 py-1.5 rounded-lg border border-amber-200 transition text-xs"
        >
          <span>🐾</span>
          <span>Admin</span>
        </Link>

        {/* Botón Iniciar Sesión General */}
        <Link
          href="/login"
          className="bg-[#f4c430] hover:bg-[#e0b020] text-gray-900 font-bold px-4 py-2 rounded-xl transition text-xs"
        >
          Iniciar Sesión
        </Link>
      </nav>
    </header>
  );
}