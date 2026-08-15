import Link from "next/link";
import { ArrowLeft, Heart, ShieldCheck, MapPin, Calendar, Dog } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PerroDetallePage({ params }: Props) {
  const resolvedParams = await params;
  const perroId = resolvedParams.id;

  const supabase = await createClient();

  // 1. Obtener los datos reales de la mascota desde Supabase
  const { data: perro, error } = await supabase
    .from("mascotas")
    .select("*")
    .eq("id", perroId)
    .single();

  if (error || !perro) {
    return (
      <main className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <Dog className="w-16 h-16 text-[#f4c430] mb-4 opacity-80" />
        <h1 className="text-2xl font-bold mb-2">Mascota no encontrada</h1>
        <p className="text-stone-400 text-sm mb-6">El perrito que buscas no existe o ya ha sido adoptado.</p>
        <Link
          href="/perros"
          className="bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold px-6 py-2.5 rounded-xl transition"
        >
          Volver al catálogo
        </Link>
      </main>
    );
  }

  // 2. Server Action para registrar la solicitud en Supabase
  async function solicitarAdopcionAction() {
    "use server";
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { error: insertError } = await supabase
      .from("solicitudes_adopcion")
      .insert({
        mascota_id: perro.id,
        refugio_id: perro.refugio_id || null,
        adoptante_id: user.id,
      });

    if (insertError) {
      console.error("Error al registrar solicitud:", insertError.message);
      return;
    }

    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-stone-900 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón Volver */}
        <Link
          href="/perros"
          className="inline-flex items-center gap-2 text-[#f4c430] hover:underline mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al catálogo
        </Link>

        {/* Tarjeta Principal de Detalle */}
        <div className="bg-stone-800 border border-stone-700 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
          
          {/* Imagen de la mascota */}
          <div className="relative h-72 md:h-full bg-stone-900 min-h-[300px]">
            <img
              src={perro.imagen_url || "/amigo.jpg"}
              alt={perro.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-md p-2.5 rounded-full border border-stone-700 text-red-400">
              <Heart className="w-5 h-5 fill-red-400/20" />
            </div>
          </div>

          {/* Información detallada */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-black text-white">{perro.nombre}</h1>
                {perro.sexo && (
                  <span className="bg-[#f4c430]/20 text-[#f4c430] text-xs font-bold px-3 py-1 rounded-full border border-[#f4c430]/30">
                    {perro.sexo}
                  </span>
                )}
              </div>

              <p className="text-stone-400 text-sm mb-4">{perro.raza}</p>

              {/* Detalles rápido */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-700 flex items-center gap-2.5 text-xs text-stone-300">
                  <Calendar className="w-4 h-4 text-[#f4c430]" />
                  <span><strong>Edad:</strong> {perro.edad}</span>
                </div>
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-700 flex items-center gap-2.5 text-xs text-stone-300">
                  <MapPin className="w-4 h-4 text-[#f4c430]" />
                  <span className="truncate">{perro.ubicacion || "Quito, Ecuador"}</span>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-2">Sobre {perro.nombre}</h3>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {perro.descripcion || "Mascota en busca de un hogar amoroso."}
                </p>
              </div>
            </div>

            {/* Acción de Adopción */}
            <div className="pt-4 border-t border-stone-700">
              <form action={solicitarAdopcionAction}>
                <button
                  type="submit"
                  className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-extrabold py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>🐾</span>
                  <span>Solicitar Adopción</span>
                </button>
              </form>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
