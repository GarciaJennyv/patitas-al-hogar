"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ShieldCheck, 
  Building2, 
  Dog, 
  CheckCircle2, 
  LogOut, 
  Clock, 
  Check, 
  X 
} from "lucide-react";

interface Refugio {
  id: string;
  nombre: string;
  ruc_o_identificacion?: string;
  refugio_verificado: boolean;
  created_at: string;
}

interface Mascota {
  id: string;
  nombre: string;
  raza: string;
  edad: string;
  imagen: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  user_id: string;
  perfiles?: { nombre: string };
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<"refugios" | "mascotas">("refugios");
  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    // 1. Verificar sesión de usuario
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/loginadmin");
      return;
    }

    // 2. Verificar rol de Administrador
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (perfil?.rol !== "admin") {
      await supabase.auth.signOut();
      router.push("/loginadmin");
      return;
    }

    // 3. Cargar lista de Refugios
    const { data: refugiosData } = await supabase
      .from("perfiles")
      .select("*")
      .eq("rol", "refugio")
      .order("created_at", { ascending: false });

    if (refugiosData) setRefugios(refugiosData);

    // 4. Cargar lista de Mascotas
    const { data: mascotasData } = await supabase
      .from("mascotas")
      .select("*, perfiles(nombre)")
      .order("created_at", { ascending: false });

    if (mascotasData) setMascotas(mascotasData);

    setLoading(false);
  };

  // --- APROBAR O REVOCAR REQUISITOS DEL REFUGIO ---
  const cambiarVerificacionRefugio = async (id: string, nuevoEstado: boolean) => {
    const { error } = await supabase
      .from("perfiles")
      .update({ refugio_verificado: nuevoEstado })
      .eq("id", id);

    if (!error) {
      setRefugios((prev) =>
        prev.map((r) => (r.id === id ? { ...r, refugio_verificado: nuevoEstado } : r))
      );
    }
  };

  // --- APROBAR O RECHAZAR MASCOTAS / FOTOS ---
  const cambiarEstadoMascota = async (id: string, nuevoEstado: "aprobado" | "rechazado") => {
    const { error } = await supabase
      .from("mascotas")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (!error) {
      setMascotas((prev) =>
        prev.map((m) => (m.id === id ? { ...m, estado: nuevoEstado } : m))
      );
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/loginadmin");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <p className="text-stone-400 animate-pulse text-sm">Cargando Panel de Administración...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#f4c430]/10 border border-[#f4c430]/30 p-3 rounded-2xl text-[#f4c430]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Panel del Administrador General
              </h1>
              <p className="text-xs text-stone-400">
                Auditoría de requisitos de refugios y verificación de mascotas
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="self-start md:self-auto flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-xl border border-stone-800 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión Admin
          </button>
        </div>

        {/* PESTAÑAS DE CONTROL */}
        <div className="flex gap-4 border-b border-stone-800">
          <button
            onClick={() => setTab("refugios")}
            className={`flex items-center gap-2 pb-3 px-2 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "refugios"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Validación de Refugios ({refugios.filter((r) => !r.refugio_verificado).length} pendientes)
          </button>

          <button
            onClick={() => setTab("mascotas")}
            className={`flex items-center gap-2 pb-3 px-2 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "mascotas"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >
            <Dog className="w-4 h-4" />
            Revisión de Fotografías ({mascotas.filter((m) => m.estado === "pendiente").length} pendientes)
          </button>
        </div>

        {/* PESTAÑA 1: REQUISITOS DE REFUGIOS */}
        {tab === "refugios" && (
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400">
              Listado de Refugios Registrados
            </h2>

            <div className="grid gap-4">
              {refugios.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center text-stone-500 text-sm">
                  No hay refugios registrados en la plataforma.
                </div>
              ) : (
                refugios.map((refugio) => (
                  <div
                    key={refugio.id}
                    className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">{refugio.nombre}</h3>
                        {refugio.refugio_verificado ? (
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verificado
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendiente Requisitos
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-1">
                        ID / Documento: <span className="text-stone-200 font-mono">{refugio.ruc_o_identificacion || "Sin registrar"}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      {refugio.refugio_verificado ? (
                        <button
                          onClick={() => cambiarVerificacionRefugio(refugio.id, false)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-2 rounded-xl transition font-semibold cursor-pointer"
                        >
                          Revocar Requisitos
                        </button>
                      ) : (
                        <button
                          onClick={() => cambiarVerificacionRefugio(refugio.id, true)}
                          className="bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Aprobar Requisitos
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: REVISIÓN DE FOTOS / MASCOTAS */}
        {tab === "mascotas" && (
          <div className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400">
              Solicitudes de Publicación de Fotografías
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mascotas.length === 0 ? (
                <div className="col-span-full bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center text-stone-500 text-sm">
                  No hay publicaciones de mascotas en revisión.
                </div>
              ) : (
                mascotas.map((mascota) => (
                  <div
                    key={mascota.id}
                    className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative h-48 bg-stone-950">
                      <img
                        src={mascota.imagen}
                        alt={mascota.nombre}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${
                        mascota.estado === "aprobado"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : mascota.estado === "rechazado"
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        {mascota.estado}
                      </span>
                    </div>

                    <div className="p-4 space-y-1.5 flex-grow">
                      <h3 className="font-extrabold text-white text-lg">{mascota.nombre}</h3>
                      <p className="text-xs text-stone-400">Raza: <strong className="text-stone-200">{mascota.raza}</strong> | Edad: <strong className="text-stone-200">{mascota.edad}</strong></p>
                      <p className="text-xs text-stone-400">Refugio: <strong className="text-[#f4c430]">{mascota.perfiles?.nombre || "No especificado"}</strong></p>
                    </div>

                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => cambiarEstadoMascota(mascota.id, "rechazado")}
                        className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs py-2 rounded-xl transition font-bold cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Rechazar
                      </button>
                      <button
                        onClick={() => cambiarEstadoMascota(mascota.id, "aprobado")}
                        className="flex items-center justify-center gap-1 bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 text-xs py-2 rounded-xl transition font-bold cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Aprobar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}