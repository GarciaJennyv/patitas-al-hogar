"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"adoptante" | "refugio">("adoptante");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Dentro de app/register/page.tsx

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, nombre, rol }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.details || data.error || "Error al registrar");
    }

    alert("¡Usuario registrado exitosamente!");
    // Redireccionar según el rol
    if (rol === "refugio") {
      router.push("/dashboard");
    } else {
      router.push("/perros");
    }

  } catch (err: any) {
    console.error("Error devuelto:", err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6 text-white font-sans">
      <div className="max-w-md w-full bg-stone-800 p-8 rounded-3xl shadow-2xl border border-stone-700">
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <PawPrint className="w-8 h-8 text-[#f4c430]" />
          <h1 className="text-2xl font-extrabold">Crear Cuenta</h1>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-xl mb-4 text-sm text-center">
            ¡Cuenta creada exitosamente! Redirigiendo...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre completo</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Selecciona tu rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as "adoptante" | "refugio")}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] cursor-pointer"
            >
              <option value="adoptante">Adoptante (Busca adoptar)</option>
              <option value="refugio">Refugio (Publica mascotas)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold py-3 rounded-xl transition shadow-lg mt-4 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center text-stone-400 text-sm mt-6">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/loginadmin" className="text-[#f4c430] hover:underline font-medium">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}