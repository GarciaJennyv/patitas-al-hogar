"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PawPrint, LogOut, PlusCircle, LayoutDashboard } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerRolUsuario() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: perfil } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", user.id)
          .single();

        setRol(perfil?.rol || null);
      }
      setLoading(false);
    }

    obtenerRolUsuario();
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-stone-900 text-white font-sans flex flex-col">
      {/* Barra de navegación superior del Dashboard */}
      <header className="bg-stone-800/80 backdrop-blur-md border-b border-stone-700/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo estático */}
          <div className="flex items-center gap-2.5 select-none">
            <div className="bg-stone-900 p-2 rounded-xl border border-stone-700 text-[#f4c430]">
              <PawPrint className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white">
              Patitas al Hogar
            </span>
          </div>

          {/* Menú de navegación rápida: Se muestra ÚNICAMENTE si el usuario es refugio */}
          {!loading && rol === "refugio" && (
            <nav className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/dashboard/refugio"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-300 hover:text-[#f4c430] px-3 py-2 rounded-xl hover:bg-stone-700/50 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Panel</span>
              </Link>

              <Link
                href="/dashboard/refugio/publicar"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-stone-900 bg-[#f4c430] hover:bg-[#e0b020] px-3.5 py-2 rounded-xl transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nueva Mascota</span>
              </Link>

              <div className="h-4 w-px bg-stone-700 mx-1" />

              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-400 hover:text-red-400 p-2 rounded-xl hover:bg-stone-700/50 transition cursor-pointer"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </nav>
          )}

        </div>
      </header>

      {/* Contenido dinámico */}
      <div className="flex-grow">{children}</div>

      {/* Pie de página administrativo */}
      <footer className="border-t border-stone-800 bg-stone-900/50 py-4 text-center text-xs text-stone-500">
        Patitas al Hogar • Sistema de Gestión de Refugios y Adopción
      </footer>
    </div>
  );
}