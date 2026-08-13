"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-100 py-3 px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <span className="text-amber-500 text-2xl">🐾</span>
          <span>Patitas <span className="text-amber-500">al Hogar</span></span>
        </Link>

        {/* NAVEGACIÓN Y BOTONES (UN SOLO GRUPO) */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-amber-500 transition">
            Inicio
          </Link>
          <Link href="/perros" className="text-sm font-medium text-gray-600 hover:text-amber-500 transition">
            Perros
          </Link>

          {/* BOTÓN PANEL ADMIN (ÚNICO) */}
          <Link
            href="/loginadmin"
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-gray-900 font-semibold px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-amber-300 transition shadow-sm cursor-pointer"
          >
            <span>🐾</span>
            <span>Panel Admin</span>
          </Link>

          {/* BOTÓN INICIAR SESIÓN */}
          <Link
            href="/login"
            className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-4 py-1.5 text-xs sm:text-sm rounded-full shadow transition"
          >
            Iniciar Sesión
          </Link>
        </div>

      </div>
    </header>
  );
}