"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  // Datos de la cuenta
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"adoptante" | "refugio">("adoptante");

  // Datos del refugio
  const [nombreRefugio, setNombreRefugio] = useState("");
  const [responsable, setResponsable] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const supabase = createClient();

      // Validaciones adicionales para refugio
      if (rol === "refugio") {
        if (
          !nombreRefugio ||
          !responsable ||
          !telefono ||
          !direccion ||
          !ciudad
        ) {
          setError(
            "Por favor completa toda la información del refugio."
          );
          setLoading(false);
          return;
        }
      }

      // 1. Crear cuenta en Supabase Auth
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre,
              rol,
            },
          },
        });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("No se pudo crear el usuario.");
        setLoading(false);
        return;
      }

      // 2. Si es refugio, guardar información del refugio
      if (rol === "refugio") {
        const { error: refugioError } = await supabase
          .from("refugios")
          .insert({
            usuario_id: data.user.id,
            nombre: nombreRefugio,
            responsable: responsable,
            correo: email,
            telefono: telefono,
            direccion: direccion,
            ciudad: ciudad,
            descripcion: descripcion,
            estado: "pendiente",
          });

        if (refugioError) {
          console.error(
            "Error al guardar refugio:",
            refugioError
          );

          setError(
            "La cuenta se creó, pero no se pudo guardar la información del refugio."
          );

          setLoading(false);
          return;
        }
      }

      setSuccess(true);

      setTimeout(() => {
        if (rol === "refugio") {
          router.push("/dashboard/refugio");
        } else {
          router.push("/dashboard/adoptante");
        }
      }, 1200);

    } catch (err) {
      console.error("Error inesperado:", err);

      setError(
        "Ocurrió un error inesperado al conectar con el servicio."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6 text-white font-sans">

      <div className="max-w-md w-full bg-stone-800 p-8 rounded-3xl shadow-2xl border border-stone-700">

        {/* Título */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <PawPrint className="w-8 h-8 text-[#f4c430]" />

          <h1 className="text-2xl font-extrabold">
            Crear Cuenta
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Éxito */}
        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-xl mb-4 text-sm text-center">
            ¡Cuenta creada exitosamente! Redirigiendo...
          </div>
        )}

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >

          {/* ========================= */}
          {/* DATOS DE LA CUENTA */}
          {/* ========================= */}

          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre completo
            </label>

            <input
              type="text"
              required
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Correo electrónico
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="••••••••"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Selecciona tu rol
            </label>

            <select
              value={rol}
              onChange={(e) =>
                setRol(
                  e.target.value as
                    | "adoptante"
                    | "refugio"
                )
              }
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] cursor-pointer"
            >
              <option value="adoptante">
                Adoptante (Busca adoptar)
              </option>

              <option value="refugio">
                Refugio (Publica mascotas)
              </option>
            </select>
          </div>

          {/* ========================= */}
          {/* INFORMACIÓN DEL REFUGIO */}
          {/* ========================= */}

          {rol === "refugio" && (
            <div className="mt-6 p-5 rounded-2xl bg-stone-900 border border-[#f4c430]/40">

              <div className="flex items-center gap-2 mb-4">
                <PawPrint className="w-5 h-5 text-[#f4c430]" />

                <h2 className="text-lg font-bold">
                  Información del refugio
                </h2>
              </div>

              {/* Nombre del refugio */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Nombre del refugio
                </label>

                <input
                  type="text"
                  required={rol === "refugio"}
                  value={nombreRefugio}
                  onChange={(e) =>
                    setNombreRefugio(e.target.value)
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
                  placeholder="Ej. Patitas Felices"
                />
              </div>

              {/* Responsable */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Nombre del responsable
                </label>

                <input
                  type="text"
                  required={rol === "refugio"}
                  value={responsable}
                  onChange={(e) =>
                    setResponsable(e.target.value)
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
                  placeholder="Nombre del responsable"
                />
              </div>

              {/* Teléfono */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Teléfono
                </label>

                <input
                  type="tel"
                  required={rol === "refugio"}
                  value={telefono}
                  onChange={(e) =>
                    setTelefono(e.target.value)
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
                  placeholder="0991234567"
                />
              </div>

              {/* Dirección */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Dirección
                </label>

                <input
                  type="text"
                  required={rol === "refugio"}
                  value={direccion}
                  onChange={(e) =>
                    setDireccion(e.target.value)
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
                  placeholder="Dirección del refugio"
                />
              </div>

              {/* Ciudad */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Ciudad
                </label>

                <input
                  type="text"
                  required={rol === "refugio"}
                  value={ciudad}
                  onChange={(e) =>
                    setCiudad(e.target.value)
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
                  placeholder="Ej. Guayaquil"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Descripción del refugio
                </label>

                <textarea
                  value={descripcion}
                  onChange={(e) =>
                    setDescripcion(e.target.value)
                  }
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] resize-none"
                  placeholder="Cuéntanos sobre el refugio..."
                  rows={4}
                />
              </div>

            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold py-3 rounded-xl transition shadow-lg mt-4 cursor-pointer disabled:opacity-50"
          >
            {loading
              ? "Registrando..."
              : success
              ? "¡Registrado!"
              : "Registrarse"}
          </button>

        </form>

        <p className="text-center text-stone-400 text-sm mt-6">

          ¿Ya tienes una cuenta?{" "}

          <Link
            href="/login"
            className="text-[#f4c430] hover:underline font-medium"
          >
            Inicia sesión aquí
          </Link>

        </p>

      </div>
    </div>
  );
}