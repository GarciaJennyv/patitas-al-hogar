"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail ,ArrowLeft} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Credenciales inválidas. Verifica tu correo o contraseña.");

      const userId = authData.user.id;
      console.log("Usuario autenticado ID:", userId);

      // 2. Consultar perfil usando maybeSingle() para evitar excepciones silenciosas de .single()
      const { data: profile, error: profileError } = await supabase
  .from("profiles")
  .select("rol")
  .eq("id", userId)
  .maybeSingle();

      console.log("Resultado perfil:", profile, "Error perfil:", profileError);

      if (profileError) {
        throw new Error(`Error al verificar perfil: ${profileError.message}`);
      }

      if (!profile || profile.rol !== "admin") {
        await supabase.auth.signOut();
        throw new Error(`Acceso denegado: Tu rol actual es '${profile?.rol || "desconocido"}'. Se requiere 'admin'.`);
      }

      // 3. Redirigir al Dashboard
      router.push("/admin");
      router.refresh();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
       <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-stone-400 hover:text-white text-sm font-semibold transition bg-stone-900 border border-stone-800 px-4 py-2 rounded-xl"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver al inicio</span>
      </Link>
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#f4c430]/10 border border-[#f4c430]/30 rounded-2xl text-[#f4c430] mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Acceso Administrativo</h1>
          <p className="text-xs text-stone-400">Ingresa tus credenciales de administrador para continuar</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="admin@ejemplo.com"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-stone-600 outline-none focus:border-[#f4c430] transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-stone-600 outline-none focus:border-[#f4c430] transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-bold py-3 rounded-xl text-sm transition cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? "Verificando Credenciales..." : "Ingresar al Panel"}
          </button>
        </form>
      </div>
    </main>
  );
}