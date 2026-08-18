"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function RefugioDashboardPage() {
  const supabase = createClient();
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Consultar mascotas asociadas al refugio
        const { data: petData } = await supabase
          .from("mascotas")
          .select("*")
          .or(`refugio_id.eq.${user.id},user_id.eq.${user.id}`);

        if (petData) setMascotas(petData);

        // Consultar solicitudes de adopción
        const { data: solData } = await supabase
          .from("solicitudes")
          .select("*, mascotas(*)")
          .eq("refugio_id", user.id);

        if (solData) setSolicitudes(solData);
      }

      setCargando(false);
    }

    cargarDatos();
  }, []);

  if (cargando) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-stone-400">
        Cargando panel del refugio...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel del Refugio</h1>
          <p className="text-xs text-stone-400">
            Gestión de publicaciones y solicitudes de adopción
          </p>
        </div>
        <Link
          href="/dashboard/refugio/publicar"
          className="bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition"
        >
          + Nueva Mascota
        </Link>
      </div>

      {/* Listado de Mascotas */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-stone-200 tracking-wider uppercase mb-4">
          Mis Mascotas Publicadas ({mascotas.length})
        </h2>

        {mascotas.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">
            Aún no has publicado ninguna mascota.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mascotas.map((pet) => (
              <div
                key={pet.id}
                className="bg-stone-950 border border-stone-800 rounded-xl overflow-hidden p-3 flex gap-3 items-center"
              >
                <img
                  src={pet.imagen_url || pet.imagen || "/placeholder.png"}
                  alt={pet.nombre}
                  className="w-16 h-16 rounded-lg object-cover bg-stone-900 flex-shrink-0"
                />
                <div className="overflow-hidden flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white truncate">
                      {pet.nombre}
                    </h3>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium">
                      {pet.estado}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 truncate">
                    {pet.especie} • {pet.raza || "Mestizo"}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">
                    {pet.edad} • {pet.tamanio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Listado de Solicitudes */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-stone-200 tracking-wider uppercase mb-4">
          Solicitudes de Adopción Recibidas ({solicitudes.length})
        </h2>

        {solicitudes.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-6">
            No hay solicitudes pendientes de evaluación en este momento.
          </p>
        ) : (
          <div className="space-y-3">
            {solicitudes.map((sol) => (
              <div
                key={sol.id}
                className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex justify-between items-center"
              >
                <div>
                  <p className="text-sm font-bold text-white">
                    Solicitud para: {sol.mascotas?.nombre || "Mascota"}
                  </p>
                  <p className="text-xs text-stone-400">
                    Estado: {sol.estado || "Pendiente"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}