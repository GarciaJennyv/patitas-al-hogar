"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Plus, Edit3, Trash2, CheckCircle2, X } from "lucide-react";

export default function RefugioDashboardPage() {
  const supabase = createClient();
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // Estado para el modal de edición (Update)
  const [mascotaAEditar, setMascotaAEditar] = useState<any | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  // 1. READ (Leer mascotas y solicitudes)
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
        .or(`refugio_id.eq.${user.id},user_id.eq.${user.id}`)
        .order("id", { ascending: false });

      if (petData) setMascotas(petData);

      // Consultar solicitudes de adopción
      const { data: solData, error: solError } = await supabase
        .from("solicitudes_adopcion")
        .select("*, mascotas(*)")
        .eq("refugio_id", user.id);

      if (solData) setSolicitudes(solData);
    }

    setCargando(false);
  }

  // 2. UPDATE (Actualizar estado rápido: p.ej. adoptado/disponible)
  const cambiarEstadoMascota = async (mascotaId: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from("mascotas")
      .update({ estado: nuevoEstado })
      .eq("id", mascotaId);

    if (error) {
      alert("Error al actualizar el estado: " + error.message);
      return;
    }

    setMascotas((prev) =>
      prev.map((m) => (m.id === mascotaId ? { ...m, estado: nuevoEstado } : m))
    );
  };

  // 2. UPDATE (Guardar formulario de edición completo)
  const guardarEdicionMascota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mascotaAEditar) return;

    const { error } = await supabase
      .from("mascotas")
      .update({
        nombre: mascotaAEditar.nombre,
        especie: mascotaAEditar.especie,
        raza: mascotaAEditar.raza,
        edad: mascotaAEditar.edad,
        tamanio: mascotaAEditar.tamanio,
        estado: mascotaAEditar.estado,
      })
      .eq("id", mascotaAEditar.id);

    if (error) {
      alert("Error al guardar cambios: " + error.message);
      return;
    }

    setMascotas((prev) =>
      prev.map((m) => (m.id === mascotaAEditar.id ? mascotaAEditar : m))
    );
    setMascotaAEditar(null);
  };

  // 3. DELETE (Eliminar mascota)
  const eliminarMascota = async (mascotaId: string) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
    );
    if (!confirmar) return;

    const { error } = await supabase
      .from("mascotas")
      .delete()
      .eq("id", mascotaId);

    if (error) {
      alert("Error al eliminar la mascota: " + error.message);
      return;
    }

    setMascotas((prev) => prev.filter((m) => m.id !== mascotaId));
  };

  if (cargando) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-stone-400">
        Cargando panel del refugio...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Encabezado (CREATE esta vinculado a /publicar) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Panel del Refugio</h1>
          <p className="text-xs text-stone-400">
            Gestión de publicaciones y solicitudes de adopción
          </p>
        </div>
        
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
                className="bg-stone-950 border border-stone-800 rounded-xl overflow-hidden p-4 flex flex-col justify-between"
              >
                <div className="flex gap-3 items-start">
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
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium capitalize">
                        {pet.estado}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 truncate mt-0.5">
                      {pet.especie} • {pet.raza || "Mestizo"}
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      {pet.edad} • {pet.tamanio}
                    </p>
                  </div>
                </div>

                {/* ACCIONES DEL CRUD (EDITAR, ELIMINAR, ESTADO) */}
                <div className="flex items-center justify-between border-t border-stone-800/80 mt-4 pt-3 text-xs">
                  <button
                    onClick={() =>
                      cambiarEstadoMascota(
                        pet.id,
                        pet.estado === "adoptado" ? "disponible" : "adoptado"
                      )
                    }
                    className="text-stone-400 hover:text-emerald-400 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {pet.estado === "adoptado" ? "Disponible" : "Adoptado"}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setMascotaAEditar(pet)}
                      className="p-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 rounded-lg transition cursor-pointer"
                      title="Editar Mascota"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => eliminarMascota(pet.id)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 rounded-lg transition cursor-pointer"
                      title="Eliminar Mascota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex justify-between items-center gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">
                    Solicitud para: {sol.mascotas?.nombre || "Mascota"}
                  </p>

                  <p className="text-xs text-stone-400 mt-1">
                    Adoptante: {sol.nombres_apellidos || "Sin nombre"}
                  </p>

                  <p className="text-xs text-stone-400">
                    Estado: {sol.estado || "Pendiente"}
                  </p>
                </div>

                <Link
                  href="/dashboard/refugio/solicitudes"
                  className="bg-amber-400 hover:bg-amber-500 text-stone-950 px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Ver solicitud
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN (UPDATE) */}
      {mascotaAEditar && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 w-full max-w-md rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <h3 className="text-lg font-bold text-white">Editar Mascota</h3>
              <button
                onClick={() => setMascotaAEditar(null)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarEdicionMascota} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-400 mb-1 block">Nombre</label>
                <input
                  type="text"
                  value={mascotaAEditar.nombre || ""}
                  onChange={(e) =>
                    setMascotaAEditar({ ...mascotaAEditar, nombre: e.target.value })
                  }
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 mb-1 block">Especie</label>
                  <input
                    type="text"
                    value={mascotaAEditar.especie || ""}
                    onChange={(e) =>
                      setMascotaAEditar({ ...mascotaAEditar, especie: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block">Raza</label>
                  <input
                    type="text"
                    value={mascotaAEditar.raza || ""}
                    onChange={(e) =>
                      setMascotaAEditar({ ...mascotaAEditar, raza: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 mb-1 block">Edad</label>
                  <input
                    type="text"
                    value={mascotaAEditar.edad || ""}
                    onChange={(e) =>
                      setMascotaAEditar({ ...mascotaAEditar, edad: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-stone-400 mb-1 block">Tamaño</label>
                  <input
                    type="text"
                    value={mascotaAEditar.tamanio || ""}
                    onChange={(e) =>
                      setMascotaAEditar({ ...mascotaAEditar, tamanio: e.target.value })
                    }
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 mb-1 block">Estado</label>
                <select
                  value={mascotaAEditar.estado || "disponible"}
                  onChange={(e) =>
                    setMascotaAEditar({ ...mascotaAEditar, estado: e.target.value })
                  }
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="adoptado">Adoptado</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setMascotaAEditar(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-stone-950 rounded-xl font-bold cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}