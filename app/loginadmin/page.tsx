"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, Lock, Mail } from "lucide-react";

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

// 2. Consultar rol con .maybeSingle() para evitar excepciones si la consulta es nula
// 1. Consultar el perfil del usuario autenticado
const { data: perfil, error: perfilError } = await supabase
  .from("profiles")
  .select("rol")
  .eq("id", authData.user.id)
  .maybeSingle();

// 2. Si las políticas RLS o la conexión a la base de datos fallan
if (perfilError) {
  await supabase.auth.signOut();
  throw new Error(`Error de lectura en DB (RLS): ${perfilError.message}`);
}

// 3. Si no existe la fila del perfil para este UID
if (!perfil) {
  await supabase.auth.signOut();
  throw new Error("No se encontró ningún registro en la tabla 'profiles' para esta cuenta.");
}

// 4. Normalizar la cadena para evitar fallos por espacios o mayúsculas
const rolNormalizado = perfil.rol ? String(perfil.rol).trim().toLowerCase() : "";

// 5. Validar si el rol es realmente admin
if (rolNormalizado !== "admin") {
  await supabase.auth.signOut();
  throw new Error(`Acceso denegado: Tu rol actual es '${perfil.rol}', pero se requiere 'admin'.`);
}

      // 3. Redirigir al Dashboard (/admin)
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
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 p-8 rounded-3xl space-y-6 shadow-2xl">
        
        {/* ENCABEZADO */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#f4c430]/10 border border-[#f4c430]/30 rounded-2xl text-[#f4c430] mb-2">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Acceso Administrativo</h1>
          <p className="text-xs text-stone-400">Ingresa tus credenciales de administrador para continuar</p>
        </div>

        {/* MENSAJE DE ERROR */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* FORMULARIO */}
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