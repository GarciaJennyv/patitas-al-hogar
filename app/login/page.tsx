"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { ArrowLeft, HeartHandshake, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // 1. Iniciar sesión con Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError("Correo o contraseña incorrectos. Revisa tus datos.");
      setLoading(false);
      return;
    }

    // 2. Intentar obtener el rol desde la metadata del usuario
    let rol = data.user.user_metadata?.rol;

    // Si no está en la metadata, consultar la tabla de perfiles
    if (!rol) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", data.user.id)
        .maybeSingle();

      rol = perfil?.rol || "adoptante";
    }

    // 3. Bloquear acceso a Administradores
    if (rol === "admin") {
      await supabase.auth.signOut();
      setError("Acceso denegado. Si eres Administrador, debes ingresar por el portal específico.");
      setLoading(false);
      return;
    }

    // 4. Refrescar las cookies de la sesión en el navegador
    router.refresh();

    // 5. Redirección según el rol
    if (rol === "refugio") {
      router.push("/dashboard/refugio");
    } else {
      router.push("/perros");
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Enlace para regresar */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-600 text-sm mb-6 transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </Link>

        {/* Tarjeta de Formulario */}
        <div className="bg-white border border-stone-200 p-8 rounded-3xl shadow-xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-amber-100 p-3 rounded-2xl text-[#f4c430] mb-3">
              <HeartHandshake className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-black text-stone-800">
              ¡Bienvenido a Patitas al Hogar!
            </h1>
            <p className="text-stone-500 text-xs mt-1">
              Ingresa como <strong className="text-stone-700">Adoptante</strong> o <strong className="text-stone-700">Refugio</strong>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-stone-500 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-amber-400 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold text-stone-500 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:border-amber-400 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold py-3.5 rounded-xl transition shadow-md mt-2 cursor-pointer text-sm disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Registro y Pie de formulario */}
          <div className="mt-8 pt-6 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-amber-600 font-bold hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}