"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Autenticar con Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Credenciales de administración inválidas.");
      setLoading(false);
      return;
    }

    // 2. Verificar que el usuario tenga el rol de 'admin'
    const { data: perfil, error: perfilError } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    if (perfilError || perfil?.rol !== "admin") {
      await supabase.auth.signOut();
      setError("Acceso denegado: Tu cuenta no tiene permisos de Administrador.");
      setLoading(false);
      return;
    }

    // 3. Redirigir al panel de administración
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Retorno */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-[#f4c430] text-sm mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al portal público
        </Link>

        {/* Tarjeta de Login Admin */}
        <div className="bg-stone-900 border border-stone-800 p-8 rounded-3xl shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-stone-800 p-3 rounded-2xl border border-stone-700 text-[#f4c430] inline-block mb-3">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Portal de Administración
            </h1>
            <p className="text-stone-400 text-xs mt-1">
              Validación y control de refugios y mascotas
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-stone-400 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Correo Institucional
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@patitas.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-stone-400 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Clave de Seguridad
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-black py-3.5 rounded-xl transition shadow-lg mt-2 cursor-pointer text-sm disabled:opacity-50"
            >
              {loading ? "Verificando Credenciales..." : "Ingresar al Panel Admin"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}