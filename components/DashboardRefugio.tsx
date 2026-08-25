"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

// Interfaz que coincide al 100% con tu esquema SQL
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

export default function DashboardRefugio() {
  const supabase = createClient();

  // Estados de datos
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEspecie, setFilterEspecie] = useState("todas");
  const [filterEstado, setFilterEstado] = useState("todos");

  // Modal (Crear / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Mascota |null >(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    especie: "perro",
    raza: "",
    edad: "",
    tamano: "mediano",
    estado: "disponible",
    descripcion: "",
    imagen_url: "",
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cargar usuario autenticado y mascotas
  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setErrorMsg(null);

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setErrorMsg("Debes iniciar sesión para administrar las mascotas de tu refugio.");
        setLoading(false);
        return;
      }

      setCurrentUser(user);
      await fetchMascotas(user.id);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  // Función para obtener las mascotas registradas por este refugio
  const fetchMascotas = async (refugioId: string) => {
    const { data, error } = await supabase
      .from("mascotas")
      .select("*")
      .eq("refugio_id", refugioId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al cargar mascotas:", error.message);
      setErrorMsg("Ocurrió un error al cargar el inventario de mascotas.");
    } else {
      setMascotas(data || []);
    }
  };

  // Abrir Modal para Crear
  const handleOpenCreateModal = () => {
    setEditingPet(null);
    setFormData({
      nombre: "",
      especie: "perro",
      raza: "",
      edad: "",
      tamano: "mediano",
      estado: "disponible",
      descripcion: "",
      imagen_url: "",
    });
    setIsModalOpen(true);
  };

  // Abrir Modal para Editar
  const handleOpenEditModal = (pet: Mascota) => {
    setEditingPet(pet);
    setFormData({
      nombre: pet.nombre || "",
      especie: pet.especie || "perro",
      raza: pet.raza || "",
      edad: pet.edad !== null && pet.edad !== undefined ? String(pet.edad) : "",
      tamano: pet.tamano || "mediano",
      estado: pet.estado || "disponible",
      descripcion: pet.descripcion || "",
      imagen_url: pet.imagen_url || "",
    });
    setIsModalOpen(true);
  };

  // Enviar Formulario (CREATE / UPDATE)
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    setErrorMsg(null);

    const payload = {
      nombre: formData.nombre.trim(),
      especie: formData.especie,
      raza: formData.raza.trim() || null,
      edad: formData.edad !== "" ? parseInt(formData.edad, 10) : null,
      tamano: formData.tamano,
      estado: formData.estado,
      descripcion: formData.descripcion.trim() || null,
      imagen_url: formData.imagen_url.trim() || null,
      refugio_id: currentUser.id,
    };

    if (editingPet) {
      // UPDATE
      const { error } = await supabase
        .from("mascotas")
        .update(payload)
        .eq("id", editingPet.id);

      if (error) {
        alert(`Error al actualizar: ${error.message}`);
      } else {
        setIsModalOpen(false);
        fetchMascotas(currentUser.id);
      }
    } else {
      // CREATE
      const { error } = await supabase
        .from("mascotas")
        .insert([payload]);

      if (error) {
        alert(`Error al guardar: ${error.message}`);
      } else {
        setIsModalOpen(false);
        fetchMascotas(currentUser.id);
      }
    }

    setSaving(false);
  };

  // Eliminar mascota (DELETE)
  const handleDeletePet = async (id: string, nombre: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar a "${nombre}"? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("mascotas")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`Error al eliminar: ${error.message}`);
    } else {
      setMascotas((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Filtrado dinámico
  const filteredMascotas = useMemo(() => {
    return mascotas.filter((pet) => {
      const matchesSearch =
        pet.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pet.raza && pet.raza.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesEspecie =
        filterEspecie === "todas" || pet.especie.toLowerCase() === filterEspecie;

      const matchesEstado =
        filterEstado === "todos" || pet.estado.toLowerCase() === filterEstado;

      return matchesSearch && matchesEspecie && matchesEstado;
    });
  }, [mascotas, searchTerm, filterEspecie, filterEstado]);

  // Métricas rápidas
  const stats = useMemo(() => {
    const total = mascotas.length;
    const disponibles = mascotas.filter((m) => m.estado === "disponible").length;
    const enProceso = mascotas.filter((m) => m.estado === "en proceso").length;
    const adoptados = mascotas.filter((m) => m.estado === "adoptado").length;
    return { total, disponibles, enProceso, adoptados };
  }, [mascotas]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-amber-400 tracking-tight flex items-center gap-2">
              🐾 Dashboard Refugio
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Administra el inventario de peluditos en adopción (Patitas al Hogar)
            </p>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Mascota
          </button>
        </div>

        {/* Tarjetas Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl">
            <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Total Mascotas</p>
            <p className="text-3xl font-black text-slate-100 mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-800/80 border border-emerald-500/30 p-4 rounded-2xl">
            <p className="text-emerald-400 text-xs uppercase font-bold tracking-wider">Disponibles</p>
            <p className="text-3xl font-black text-emerald-400 mt-1">{stats.disponibles}</p>
          </div>
          <div className="bg-slate-800/80 border border-amber-500/30 p-4 rounded-2xl">
            <p className="text-amber-400 text-xs uppercase font-bold tracking-wider">En Proceso</p>
            <p className="text-3xl font-black text-amber-400 mt-1">{stats.enProceso}</p>
          </div>
          <div className="bg-slate-800/80 border border-blue-500/30 p-4 rounded-2xl">
            <p className="text-blue-400 text-xs uppercase font-bold tracking-wider">Adoptados</p>
            <p className="text-3xl font-black text-blue-400 mt-1">{stats.adoptados}</p>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="w-full md:w-1/2 relative">
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
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="todas">Todas las especies</option>
              <option value="perro">Perro</option>
              <option value="gato">Gato</option>
              <option value="otro">Otro</option>
            </select>

            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="en proceso">En Proceso</option>
              <option value="adoptado">Adoptado</option>
            </select>
          </div>
        </div>

        {/* Tabla de Registros */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full mb-3"></div>
            <p>Cargando información del refugio...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-950/40 border border-red-800/60 text-red-300 p-4 rounded-xl text-center">
            {errorMsg}
          </div>
        ) : filteredMascotas.length === 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-lg font-medium">No se encontraron mascotas.</p>
            <p className="text-sm text-slate-500 mt-1">
              Prueba cambiando los filtros o registra tu primera mascota con el botón superior.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-800/60 border border-slate-700/60 rounded-2xl shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Imagen</th>
                  <th className="p-4">Mascota</th>
                  <th className="p-4">Especie / Raza</th>
                  <th className="p-4">Edad / Tamaño</th>
                  <th className="p-4">Estado</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {filteredMascotas.map((pet) => (
                  <tr key={pet.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <img
                        src={pet.imagen_url || "[https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200](https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200)"}
                        alt={pet.nombre}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "[https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200](https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200)";
                        }}
                      />
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-100">{pet.nombre}</p>
                      {pet.descripcion && (
                        <p className="text-xs text-slate-400 truncate max-w-xs">{pet.descripcion}</p>
                      )}
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="capitalize font-semibold">{pet.especie}</span>
                      {pet.raza ? <span className="text-slate-400 text-xs block">{pet.raza}</span> : null}
                    </td>
                    <td className="p-4 text-slate-300">
                      {pet.edad !== null && pet.edad !== undefined ? `${pet.edad} año(s)` : "Sin edad"}
                      <span className="text-slate-400 text-xs block capitalize">{pet.tamano || "No especificado"}</span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          pet.estado === "disponible"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : pet.estado === "en proceso"
                            ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                            : "bg-blue-950/80 text-blue-400 border border-blue-800"
                        }`}
                      >
                        {pet.estado}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(pet)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-semibold transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletePet(pet.id, pet.nombre)}
                        className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 rounded-lg text-xs font-semibold transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Único (Crear / Editar) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-100">
                  {editingPet ? `Editar a "${editingPet.nombre}"` : "Registrar Nueva Mascota"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-100 transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="Ej. Firulais"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Especie *</label>
                    <select
                      value={formData.especie}
                      onChange={(e) => setFormData({ ...formData, especie: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="perro">Perro</option>
                      <option value="gato">Gato</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Raza</label>
                    <input
                      type="text"
                      value={formData.raza}
                      onChange={(e) => setFormData({ ...formData, raza: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="Ej. Mestizo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Edad (años)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.edad}
                      onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Tamaño</label>
                    <select
                      value={formData.tamano}
                      onChange={(e) => setFormData({ ...formData, tamano: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="pequeño">Pequeño</option>
                      <option value="mediano">Mediano</option>
                      <option value="grande">Grande</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="disponible">Disponible</option>
                      <option value="en proceso">En proceso</option>
                      <option value="adoptado">Adoptado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">URL de la Imagen</label>
                  <input
                    type="url"
                    value={formData.imagen_url}
                    onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Descripción / Historia</label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-100 focus:outline-none focus:border-amber-500 resize-none"
                    placeholder="Escribe brevemente sobre la personalidad o historial médico..."
                  ></textarea>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : editingPet ? "Guardar Cambios" : "Crear Registro"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}