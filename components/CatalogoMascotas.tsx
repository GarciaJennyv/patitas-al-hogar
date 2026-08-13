"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza?: string | null;
  edad?: number | null;
  tamano?: string | null;
  estado: string;
  descripcion?: string | null;
  imagen_url?: string | null;
  refugio_id: string;
  created_at: string;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600";

export default function CatalogoMascotas() {
  const supabase = createClient();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecie, setFilterEspecie] = useState("todas");
  const [filterTamano, setFilterTamano] = useState("todos");

  // Cargar solo las mascotas que están 'disponible'
  useEffect(() => {
    async function loadCatalogo() {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("mascotas")
        .select("*")
        .eq("estado", "disponible")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener mascotas:", error.message);
        setErrorMsg("Ocurrió un error al cargar el catálogo de mascotas.");
      } else {
        setMascotas(data || []);
      }
      setLoading(false);
    }

    loadCatalogo();
  }, []);

  // Filtrado en el cliente
  const filteredMascotas = useMemo(() => {
    return mascotas.filter((pet) => {
      const matchesSearch =
        pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.raza && pet.raza.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEspecie =
        filterEspecie === "todas" || pet.especie.toLowerCase() === filterEspecie;

      const matchesTamano =
        filterTamano === "todos" || pet.tamano?.toLowerCase() === filterTamano;

      return matchesSearch && matchesEspecie && matchesTamano;
    });
  }, [mascotas, searchTerm, filterEspecie, filterTamano]);

  return (
    <section className="py-12 bg-slate-900 text-slate-100 min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
            🐾 Encuentra a tu Compañero Ideal
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Conoce a los peluditos que buscan un hogar amoroso en Patitas al Hogar.
          </p>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
          <div className="w-full md:w-1/2">
            <input
              type="text"
              placeholder="Buscar por nombre o raza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>

          <div className="flex w-full md:w-auto gap-3">
            <select
              value={filterEspecie}
              onChange={(e) => setFilterEspecie(e.target.value)}
              className="w-1/2 md:w-auto bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="todas">Todas las especies</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="otro">Otro</option>
            </select>

            <select
              value={filterTamano}
              onChange={(e) => setFilterTamano(e.target.value)}
              className="w-1/2 md:w-auto bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos los tamaños</option>
              <option value="pequeño">Pequeño</option>
              <option value="mediano">Mediano</option>
              <option value="grande">Grande</option>
            </select>
          </div>
        </div>

        {/* Listado de Tarjetas */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3"></div>
            <p>Cargando mascotas disponibles...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-950/40 border border-red-800/60 text-red-300 p-4 rounded-xl text-center">
            {errorMsg}
          </div>
        ) : filteredMascotas.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-lg font-medium">No encontramos mascotas con esos filtros.</p>
            <p className="text-sm text-slate-500 mt-1">
              Intenta cambiar los términos de búsqueda o los filtros seleccionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMascotas.map((pet) => (
              <div
                key={pet.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:border-slate-600 transition duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Imagen */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                    <img
                      src={pet.imagen_url || DEFAULT_IMAGE}
                      alt={pet.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                      }}
                    />
                    <span className="absolute top-3 right-3 bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-xs font-bold px-2.5 py-1 rounded-full capitalize">
                      {pet.especie}
                    </span>
                  </div>

                  {/* Info Principal */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition">
                        {pet.nombre}
                      </h3>
                      <p className="text-xs text-amber-500 font-medium">
                        {pet.raza || "Raza no especificada"}
                      </p>
                    </div>

                    {/* Tags (Edad y Tamaño) */}
                    <div className="flex gap-2 text-xs">
                      <span className="bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-lg">
                        {pet.edad !== null && pet.edad !== undefined
                          ? `${pet.edad} año(s)`
                          : "Edad desc."}
                      </span>
                      <span className="bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-lg capitalize">
                        {pet.tamano || "Tamaño desc."}
                      </span>
                    </div>

                    {/* Descripción */}
                    {pet.descripcion && (
                      <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed">
                        {pet.descripcion}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botón Acción */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() =>
                      alert(`Iniciando solicitud para adoptar a ${pet.nombre}`)
                    }
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Quiero Adoptar</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}