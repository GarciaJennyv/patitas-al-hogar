"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, PawPrint, Image as ImageIcon, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function NuevaMascotaPage() {
  const router = useRouter();
  const supabase = createClient();

  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("perro");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");
  const [tamano, setTamano] = useState("mediano");
  const [descripcion, setDescripcion] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setFeedback({
        type: "error",
        message: "Debes estar autenticado para agregar registros.",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("mascotas").insert([
      {
        nombre,
        especie,
        raza,
        edad: edad ? parseInt(edad, 10) : null,
        tamano,
        descripcion,
        imagen_url: imagenUrl,
        refugio_id: user.id,
      },
    ]);

    if (error) {
      setFeedback({
        type: "error",
        message: `Error al registrar mascota: ${error.message}`,
      });
    } else {
      setFeedback({
        type: "success",
        message: "Mascota agregada exitosamente. Redirigiendo...",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-stone-900 text-white p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Navegación de retorno */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#f4c430] hover:underline mb-8 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel general
        </Link>

        {/* Tarjeta del Formulario */}
        <div className="bg-stone-800 border border-stone-700 p-8 rounded-3xl shadow-2xl">
          
          {/* Encabezado */}
          <div className="flex items-center gap-3 mb-6 border-b border-stone-700 pb-4">
            <div className="bg-stone-900 p-3 rounded-2xl border border-stone-700 text-[#f4c430]">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Registrar Mascota</h1>
              <p className="text-stone-400 text-xs mt-0.5">
                Ingresa los datos del nuevo integrante para habilitar su adopción.
              </p>
            </div>
          </div>

          {/* Banner de Feedback (Éxito / Error) */}
          {feedback && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5">
                Nombre de la Mascota *
              </label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm"
                placeholder="Ej. Max"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5">
                  Especie
                </label>
                <select
                  value={especie}
                  onChange={(e) => setEspecie(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm cursor-pointer"
                >
                  <option value="perro">Perro</option>
                  <option value="gato">Gato</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5">
                  Raza
                </label>
                <input
                  type="text"
                  value={raza}
                  onChange={(e) => setRaza(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm"
                  placeholder="Ej. Mestizo, Golden Retriever"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5">
                  Edad (Años)
                </label>
                <input
                  type="number"
                  min="0"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm"
                  placeholder="Ej. 2"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5">
                  Tamaño
                </label>
                <select
                  value={tamano}
                  onChange={(e) => setTamano(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm cursor-pointer"
                >
                  <option value="pequeño">Pequeño</option>
                  <option value="mediano">Mediano</option>
                  <option value="grande">Grande</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-stone-400" /> URL de la Imagen
              </label>
              <input
                type="url"
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-400" /> Descripción / Historia
              </label>
              <textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Escribe brevemente sobre su temperamento, estado de salud o historia..."
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-extrabold py-3.5 rounded-xl transition shadow-lg mt-4 cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? "Guardando Mascota..." : "Guardar Mascota"}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}