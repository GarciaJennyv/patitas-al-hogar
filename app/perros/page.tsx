
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function PerrosPage() {
  const supabase = createClient();
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function obtenerMascotas() {
      setLoading(true);
      const { data, error } = await supabase.from("mascotas").select("*");
      if (error) {
        console.error("Error al obtener mascotas:", error);
      } else if (data) {
        setMascotas(data);
      }
      setLoading(false);
    }
    obtenerMascotas();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-medium">Cargando peluditos...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 pb-24 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Mascotas en adopción
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Conoce a nuestros perritos que buscan un hogar
          </p>
        </div>

        {mascotas.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <p className="text-slate-700 font-medium">
              No hay perritos disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mascotas.map((m) => {
              const imgUrl = m.imagen_url || m.imagen || m.foto || "/placeholder.png";
              return (
                <div
                  key={m.id}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-md flex flex-col justify-between hover:shadow-lg transition"
                >
                  <div>
                    <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-4 bg-slate-100">
                      <img
                        src={imgUrl}
                        alt={m.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="px-1 space-y-1 mb-4">
                      <h2 className="text-2xl font-bold text-slate-900">{m.nombre}</h2>
                      <p className="text-slate-500 text-sm">
                        {m.raza || "Mestizo"} {m.edad ? `• ${m.edad}` : ""}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/perros/${m.id}`}
                    className="block text-center w-full bg-[#FFB800] hover:bg-[#e6a600] text-slate-950 font-bold py-3 rounded-2xl transition shadow-sm text-sm"
                  >
                    Ver Detalle
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}