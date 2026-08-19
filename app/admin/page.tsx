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
  X,
  Users,
  Heart,
  FileText,
  BarChart3,
  Search,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";

interface Refugio {
  id: string;
  nombre: string;
  ruc_o_identificacion?: string;
  refugio_verificado: boolean;
  created_at: string;
}

interface Usuario {
  id: string;
  nombre: string;
  email?: string;
  rol: string;
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
  perfiles?: {
    nombre: string;
  };
}

interface Solicitud {
  id: string;
  mascota_id: string;
  adoptante_id: string;
  refugio_id?: string;
  estado: "pendiente" | "aprobada" | "rechazada" | "finalizada";
  created_at: string;

  mascotas?: {
    nombre: string;
  };

  adoptante?: {
    nombre: string;
  };

  refugio?: {
    nombre: string;
  };
}

interface Estadisticas {
  usuarios: number;
  refugios: number;
  mascotas: number;
  adopciones: number;
  solicitudesPendientes: number;
  mascotasPendientes: number;
  refugiosPendientes: number;
}

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<
    "resumen" |
    "usuarios" |
    "refugios" |
    "mascotas" |
    "adopciones" |
    "reportes"
  >("resumen");

  const [refugios, setRefugios] = useState<Refugio[]>([]);
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  const [estadisticas, setEstadisticas] = useState<Estadisticas>({
    usuarios: 0,
    refugios: 0,
    mascotas: 0,
    adopciones: 0,
    solicitudesPendientes: 0,
    mascotasPendientes: 0,
    refugiosPendientes: 0,
  });

  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [busquedaRefugio, setBusquedaRefugio] = useState("");
  const [busquedaMascota, setBusquedaMascota] = useState("");

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // ============================================================
  // CARGAR TODOS LOS DATOS
  // ============================================================

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    // ----------------------------------------------------------
    // 1. VERIFICAR SESIÓN
    // ----------------------------------------------------------

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/loginadmin");
      return;
    }

    // ----------------------------------------------------------
    // 2. VERIFICAR ROL ADMIN
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // 3. CARGAR USUARIOS
    // ----------------------------------------------------------

    const { data: usuariosData } = await supabase
      .from("perfiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (usuariosData) {
      setUsuarios(usuariosData);
    }

    // ----------------------------------------------------------
    // 4. CARGAR REFUGIOS
    // ----------------------------------------------------------

    const { data: refugiosData } = await supabase
      .from("perfiles")
      .select("*")
      .eq("rol", "refugio")
      .order("created_at", { ascending: false });

    if (refugiosData) {
      setRefugios(refugiosData);
    }

    // ----------------------------------------------------------
    // 5. CARGAR MASCOTAS
    // ----------------------------------------------------------

    const { data: mascotasData } = await supabase
      .from("mascotas")
      .select("*, perfiles(nombre)")
      .order("created_at", { ascending: false });

    if (mascotasData) {
      setMascotas(mascotasData);
    }

    // ----------------------------------------------------------
    // 6. CARGAR SOLICITUDES DE ADOPCIÓN
    // ----------------------------------------------------------

    const { data: solicitudesData } = await supabase
      .from("solicitudes_adopcion")
      .select(`
        *,
        mascotas(nombre),
        adoptante:perfiles!solicitudes_adopcion_adoptante_id_fkey(nombre),
        refugio:perfiles!solicitudes_adopcion_refugio_id_fkey(nombre)
      `)
      .order("created_at", { ascending: false });

    if (solicitudesData) {
      setSolicitudes(solicitudesData);
    }

    // ----------------------------------------------------------
    // 7. CALCULAR ESTADÍSTICAS
    // ----------------------------------------------------------

    const totalUsuarios = usuariosData?.length || 0;
    const totalRefugios = refugiosData?.length || 0;
    const totalMascotas = mascotasData?.length || 0;

    const refugiosPendientes =
      refugiosData?.filter(
        (refugio) => !refugio.refugio_verificado
      ).length || 0;

    const mascotasPendientes =
      mascotasData?.filter(
        (mascota) => mascota.estado === "pendiente"
      ).length || 0;

    const solicitudesPendientes =
      solicitudesData?.filter(
        (solicitud) => solicitud.estado === "pendiente"
      ).length || 0;

    const adopciones =
      solicitudesData?.filter(
        (solicitud) =>
          solicitud.estado === "aprobada" ||
          solicitud.estado === "finalizada"
      ).length || 0;

    setEstadisticas({
      usuarios: totalUsuarios,
      refugios: totalRefugios,
      mascotas: totalMascotas,
      adopciones,
      solicitudesPendientes,
      mascotasPendientes,
      refugiosPendientes,
    });

    setLoading(false);
  };

  // ============================================================
  // VERIFICAR / REVOCAR REFUGIO
  // ============================================================

  const cambiarVerificacionRefugio = async (
    id: string,
    nuevoEstado: boolean
  ) => {
    const { error } = await supabase
      .from("perfiles")
      .update({
        refugio_verificado: nuevoEstado,
      })
      .eq("id", id);

    if (!error) {
      setRefugios((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                refugio_verificado: nuevoEstado,
              }
            : r
        )
      );

      cargarDatos();
    }
  };

  // ============================================================
  // APROBAR / RECHAZAR MASCOTA
  // ============================================================

  const cambiarEstadoMascota = async (
    id: string,
    nuevoEstado: "aprobado" | "rechazado"
  ) => {
    const { error } = await supabase
      .from("mascotas")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", id);

    if (!error) {
      setMascotas((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                estado: nuevoEstado,
              }
            : m
        )
      );

      cargarDatos();
    }
  };

  // ============================================================
  // CAMBIAR ESTADO DE USUARIO
  // ============================================================

  const cambiarEstadoUsuario = async (
    id: string,
    nuevoEstado: string
  ) => {
    // Esta función depende de que tengas un campo
    // "estado" en tu tabla perfiles.

    const { error } = await supabase
      .from("perfiles")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", id);

    if (!error) {
      cargarDatos();
    }
  };

  // ============================================================
  // CAMBIAR ESTADO DE SOLICITUD
  // ============================================================

  const cambiarEstadoSolicitud = async (
    id: string,
    nuevoEstado:
      | "pendiente"
      | "aprobada"
      | "rechazada"
      | "finalizada"
  ) => {
    const { error } = await supabase
      .from("solicitudes_adopcion")
      .update({
        estado: nuevoEstado,
      })
      .eq("id", id);

    if (!error) {
      cargarDatos();
    }
  };

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  const handleSignOut = async () => {
    await supabase.auth.signOut();

    router.push("/");

    router.refresh();
  };

  // ============================================================
  // FILTROS
  // ============================================================

  const usuariosFiltrados = usuarios.filter((usuario) =>
    usuario.nombre
      ?.toLowerCase()
      .includes(busquedaUsuario.toLowerCase())
  );

  const refugiosFiltrados = refugios.filter((refugio) =>
    refugio.nombre
      ?.toLowerCase()
      .includes(busquedaRefugio.toLowerCase())
  );

  const mascotasFiltradas = mascotas.filter((mascota) =>
    mascota.nombre
      ?.toLowerCase()
      .includes(busquedaMascota.toLowerCase())
  );

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-10 h-10 text-[#f4c430] mx-auto mb-4 animate-pulse" />

          <p className="text-stone-400 animate-pulse text-sm">
            Cargando Panel de Administración...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10">

      <div className="max-w-7xl mx-auto space-y-8">

        {/* ======================================================
            ENCABEZADO
        ====================================================== */}

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

                Gestión y supervisión de Patitas al Hogar

              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-xl border border-stone-800 text-xs font-semibold transition cursor-pointer"
            >

              <RefreshCw className="w-4 h-4" />

              Actualizar

            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-xl border border-stone-800 text-xs font-semibold transition cursor-pointer"
            >

              <LogOut className="w-4 h-4" />

              Cerrar Sesión

            </button>

          </div>

        </div>


        {/* ======================================================
            TARJETAS DE ESTADÍSTICAS
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* USUARIOS */}

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-stone-400">
                  Usuarios
                </p>

                <p className="text-3xl font-black text-white">
                  {estadisticas.usuarios}
                </p>

              </div>

              <Users className="w-8 h-8 text-blue-400" />

            </div>

          </div>


          {/* REFUGIOS */}

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-stone-400">
                  Refugios
                </p>

                <p className="text-3xl font-black text-white">
                  {estadisticas.refugios}
                </p>

              </div>

              <Building2 className="w-8 h-8 text-[#f4c430]" />

            </div>

          </div>


          {/* MASCOTAS */}

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-stone-400">
                  Mascotas
                </p>

                <p className="text-3xl font-black text-white">
                  {estadisticas.mascotas}
                </p>

              </div>

              <Dog className="w-8 h-8 text-emerald-400" />

            </div>

          </div>


          {/* ADOPCIONES */}

          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs text-stone-400">
                  Adopciones
                </p>

                <p className="text-3xl font-black text-white">
                  {estadisticas.adopciones}
                </p>

              </div>

              <Heart className="w-8 h-8 text-red-400" />

            </div>

          </div>

        </div>


        {/* ======================================================
            ALERTAS
        ====================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">

            <div className="flex items-center gap-3">

              <Clock className="w-5 h-5 text-amber-400" />

              <div>

                <p className="text-xs text-amber-300">
                  Refugios pendientes
                </p>

                <p className="text-xl font-black text-white">
                  {estadisticas.refugiosPendientes}
                </p>

              </div>

            </div>

          </div>


          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">

            <div className="flex items-center gap-3">

              <Dog className="w-5 h-5 text-amber-400" />

              <div>

                <p className="text-xs text-amber-300">
                  Mascotas pendientes
                </p>

                <p className="text-xl font-black text-white">
                  {estadisticas.mascotasPendientes}
                </p>

              </div>

            </div>

          </div>


          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">

            <div className="flex items-center gap-3">

              <Heart className="w-5 h-5 text-red-400" />

              <div>

                <p className="text-xs text-red-300">
                  Solicitudes pendientes
                </p>

                <p className="text-xl font-black text-white">
                  {estadisticas.solicitudesPendientes}
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ======================================================
            MENÚ
        ====================================================== */}

        <div className="flex gap-2 overflow-x-auto border-b border-stone-800 pb-1">

          <button
            onClick={() => setTab("resumen")}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 px-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "resumen"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >

            <BarChart3 className="w-4 h-4" />

            Resumen

          </button>


          <button
            onClick={() => setTab("usuarios")}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 px-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "usuarios"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >

            <Users className="w-4 h-4" />

            Usuarios

          </button>


          <button
            onClick={() => setTab("refugios")}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 px-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "refugios"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >

            <Building2 className="w-4 h-4" />

            Refugios

          </button>


          <button
            onClick={() => setTab("mascotas")}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 px-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "mascotas"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >

            <Dog className="w-4 h-4" />

            Mascotas

          </button>


          <button
            onClick={() => setTab("adopciones")}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 px-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "adopciones"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >

            <Heart className="w-4 h-4" />

            Adopciones

          </button>


          <button
            onClick={() => setTab("reportes")}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 px-3 font-bold text-sm border-b-2 transition cursor-pointer ${
              tab === "reportes"
                ? "border-[#f4c430] text-[#f4c430]"
                : "border-transparent text-stone-400 hover:text-stone-200"
            }`}
          >

            <FileText className="w-4 h-4" />

            Reportes

          </button>

        </div>


        {/* ======================================================
            RESUMEN
        ====================================================== */}

        {tab === "resumen" && (

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-6">

                <BarChart3 className="w-5 h-5 text-[#f4c430]" />

                <h2 className="font-bold text-white">
                  Resumen de la plataforma
                </h2>

              </div>

              <div className="space-y-4">

                <div>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-stone-400">
                      Usuarios
                    </span>

                    <span className="text-white font-bold">
                      {estadisticas.usuarios}
                    </span>

                  </div>

                  <div className="h-2 bg-stone-800 rounded-full">

                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          estadisticas.usuarios,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                <div>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-stone-400">
                      Refugios
                    </span>

                    <span className="text-white font-bold">
                      {estadisticas.refugios}
                    </span>

                  </div>

                  <div className="h-2 bg-stone-800 rounded-full">

                    <div
                      className="h-2 bg-[#f4c430] rounded-full"
                      style={{
                        width: `${Math.min(
                          estadisticas.refugios * 5,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                <div>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-stone-400">
                      Mascotas
                    </span>

                    <span className="text-white font-bold">
                      {estadisticas.mascotas}
                    </span>

                  </div>

                  <div className="h-2 bg-stone-800 rounded-full">

                    <div
                      className="h-2 bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          estadisticas.mascotas,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>


                <div>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-stone-400">
                      Adopciones
                    </span>

                    <span className="text-white font-bold">
                      {estadisticas.adopciones}
                    </span>

                  </div>

                  <div className="h-2 bg-stone-800 rounded-full">

                    <div
                      className="h-2 bg-red-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          estadisticas.adopciones * 3,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>


            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">

              <div className="flex items-center gap-3 mb-6">

                <Clock className="w-5 h-5 text-amber-400" />

                <h2 className="font-bold text-white">
                  Pendientes de atención
                </h2>

              </div>

              <div className="space-y-4">

                <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl">

                  <span className="text-sm text-stone-300">
                    Refugios por verificar
                  </span>

                  <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                    {estadisticas.refugiosPendientes}
                  </span>

                </div>


                <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl">

                  <span className="text-sm text-stone-300">
                    Mascotas por revisar
                  </span>

                  <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
                    {estadisticas.mascotasPendientes}
                  </span>

                </div>


                <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl">

                  <span className="text-sm text-stone-300">
                    Solicitudes de adopción
                  </span>

                  <span className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                    {estadisticas.solicitudesPendientes}
                  </span>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* ======================================================
            USUARIOS
        ====================================================== */}

        {tab === "usuarios" && (

          <div className="space-y-5">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-bold text-white">
                  Gestión de Usuarios
                </h2>

                <p className="text-xs text-stone-400">
                  Usuarios registrados en Patitas al Hogar
                </p>

              </div>

              <div className="relative">

                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />

                <input
                  value={busquedaUsuario}
                  onChange={(e) =>
                    setBusquedaUsuario(e.target.value)
                  }
                  placeholder="Buscar usuario..."
                  className="bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-[#f4c430]"
                />

              </div>

            </div>


            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-stone-950">

                    <tr>

                      <th className="text-left p-4 text-stone-400">
                        Nombre
                      </th>

                      <th className="text-left p-4 text-stone-400">
                        Rol
                      </th>

                      <th className="text-left p-4 text-stone-400">
                        Fecha
                      </th>

                      <th className="text-right p-4 text-stone-400">
                        Acción
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {usuariosFiltrados.map((usuario) => (

                      <tr
                        key={usuario.id}
                        className="border-t border-stone-800"
                      >

                        <td className="p-4 text-white font-semibold">
                          {usuario.nombre}
                        </td>

                        <td className="p-4">

                          <span className="bg-stone-800 text-stone-300 px-2 py-1 rounded-lg text-xs">
                            {usuario.rol}
                          </span>

                        </td>

                        <td className="p-4 text-stone-400 text-xs">
                          {new Date(
                            usuario.created_at
                          ).toLocaleDateString()}
                        </td>

                        <td className="p-4 text-right">

                          {usuario.rol !== "admin" && (

                            <button
                              onClick={() =>
                                cambiarEstadoUsuario(
                                  usuario.id,
                                  "inactivo"
                                )
                              }
                              className="text-red-400 hover:text-red-300 text-xs font-bold"
                            >

                              Desactivar

                            </button>

                          )}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}


        {/* ======================================================
            REFUGIOS
        ====================================================== */}

        {tab === "refugios" && (

          <div className="space-y-4">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-bold text-white">
                  Validación de Refugios
                </h2>

                <p className="text-xs text-stone-400">
                  Revisión de los refugios registrados
                </p>

              </div>

              <div className="relative">

                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />

                <input
                  value={busquedaRefugio}
                  onChange={(e) =>
                    setBusquedaRefugio(e.target.value)
                  }
                  placeholder="Buscar refugio..."
                  className="bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-[#f4c430]"
                />

              </div>

            </div>


            <div className="grid gap-4">

              {refugiosFiltrados.map((refugio) => (

                <div
                  key={refugio.id}
                  className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >

                  <div>

                    <div className="flex items-center gap-2">

                      <h3 className="font-bold text-white">
                        {refugio.nombre}
                      </h3>

                      {refugio.refugio_verificado ? (

                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">

                          <CheckCircle2 className="w-3 h-3" />

                          Verificado

                        </span>

                      ) : (

                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">

                          <Clock className="w-3 h-3" />

                          Pendiente

                        </span>

                      )}

                    </div>

                    <p className="text-xs text-stone-400 mt-1">

                      ID / Documento:

                      <span className="text-stone-200 font-mono ml-1">

                        {refugio.ruc_o_identificacion ||
                          "Sin registrar"}

                      </span>

                    </p>

                  </div>


                  <div>

                    {refugio.refugio_verificado ? (

                      <button
                        onClick={() =>
                          cambiarVerificacionRefugio(
                            refugio.id,
                            false
                          )
                        }
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-3 py-2 rounded-xl transition font-semibold cursor-pointer"
                      >

                        <X className="w-4 h-4 inline mr-1" />

                        Revocar

                      </button>

                    ) : (

                      <button
                        onClick={() =>
                          cambiarVerificacionRefugio(
                            refugio.id,
                            true
                          )
                        }
                        className="bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 text-xs px-4 py-2 rounded-xl font-bold transition cursor-pointer"
                      >

                        <Check className="w-4 h-4 inline mr-1" />

                        Aprobar

                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* ======================================================
            MASCOTAS
        ====================================================== */}

        {tab === "mascotas" && (

          <div className="space-y-5">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-bold text-white">
                  Revisión de Mascotas
                </h2>

                <p className="text-xs text-stone-400">
                  Aprobar o rechazar publicaciones de mascotas
                </p>

              </div>

              <div className="relative">

                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />

                <input
                  value={busquedaMascota}
                  onChange={(e) =>
                    setBusquedaMascota(e.target.value)
                  }
                  placeholder="Buscar mascota..."
                  className="bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-[#f4c430]"
                />

              </div>

            </div>


            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {mascotasFiltradas.map((mascota) => (

                <div
                  key={mascota.id}
                  className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden flex flex-col"
                >

                  <div className="relative h-48 bg-stone-950">

                    <img
                      src={mascota.imagen}
                      alt={mascota.nombre}
                      className="w-full h-full object-cover"
                    />

                    <span
                      className={`absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border backdrop-blur-md ${
                        mascota.estado === "aprobado"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : mascota.estado === "rechazado"
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}
                    >

                      {mascota.estado}

                    </span>

                  </div>


                  <div className="p-4 space-y-1.5 flex-grow">

                    <h3 className="font-extrabold text-white text-lg">
                      {mascota.nombre}
                    </h3>

                    <p className="text-xs text-stone-400">

                      Raza:

                      <strong className="text-stone-200 ml-1">
                        {mascota.raza}
                      </strong>

                    </p>

                    <p className="text-xs text-stone-400">

                      Edad:

                      <strong className="text-stone-200 ml-1">
                        {mascota.edad}
                      </strong>

                    </p>

                    <p className="text-xs text-stone-400">

                      Refugio:

                      <strong className="text-[#f4c430] ml-1">
                        {mascota.perfiles?.nombre ||
                          "No especificado"}
                      </strong>

                    </p>

                  </div>


                  <div className="p-4 pt-0 grid grid-cols-2 gap-2">

                    <button
                      onClick={() =>
                        cambiarEstadoMascota(
                          mascota.id,
                          "rechazado"
                        )
                      }
                      className="flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs py-2 rounded-xl transition font-bold cursor-pointer"
                    >

                      <X className="w-3.5 h-3.5" />

                      Rechazar

                    </button>


                    <button
                      onClick={() =>
                        cambiarEstadoMascota(
                          mascota.id,
                          "aprobado"
                        )
                      }
                      className="flex items-center justify-center gap-1 bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 text-xs py-2 rounded-xl transition font-bold cursor-pointer"
                    >

                      <Check className="w-3.5 h-3.5" />

                      Aprobar

                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* ======================================================
            ADOPCIONES
        ====================================================== */}

        {tab === "adopciones" && (

          <div className="space-y-5">

            <div>

              <h2 className="text-lg font-bold text-white">
                Solicitudes de Adopción
              </h2>

              <p className="text-xs text-stone-400">
                Supervisión de las solicitudes realizadas
              </p>

            </div>


            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead className="bg-stone-950">

                    <tr>

                      <th className="text-left p-4 text-stone-400">
                        Mascota
                      </th>

                      <th className="text-left p-4 text-stone-400">
                        Adoptante
                      </th>

                      <th className="text-left p-4 text-stone-400">
                        Refugio
                      </th>

                      <th className="text-left p-4 text-stone-400">
                        Estado
                      </th>

                      <th className="text-right p-4 text-stone-400">
                        Fecha
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {solicitudes.map((solicitud) => (

                      <tr
                        key={solicitud.id}
                        className="border-t border-stone-800"
                      >

                        <td className="p-4 text-white font-bold">

                          {solicitud.mascotas?.nombre ||
                            "Sin nombre"}

                        </td>

                        <td className="p-4 text-stone-300">

                          {solicitud.adoptante?.nombre ||
                            "Sin nombre"}

                        </td>

                        <td className="p-4 text-[#f4c430]">

                          {solicitud.refugio?.nombre ||
                            "Sin refugio"}

                        </td>

                        <td className="p-4">

                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              solicitud.estado ===
                              "aprobada"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : solicitud.estado ===
                                  "rechazada"
                                ? "bg-red-500/10 text-red-400"
                                : solicitud.estado ===
                                  "finalizada"
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-amber-500/10 text-amber-400"
                            }`}
                          >

                            {solicitud.estado}

                          </span>

                        </td>

                        <td className="p-4 text-right text-stone-400 text-xs">

                          {new Date(
                            solicitud.created_at
                          ).toLocaleDateString()}

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

        )}


        {/* ======================================================
            REPORTES
        ====================================================== */}

        {tab === "reportes" && (

          <div className="space-y-6">

            <div>

              <h2 className="text-lg font-bold text-white">
                Reportes y Estadísticas
              </h2>

              <p className="text-xs text-stone-400">
                Información general de la plataforma
              </p>

            </div>


            {/* RESUMEN */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


              {/* MASCOTAS */}

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-5">

                  <Dog className="w-5 h-5 text-emerald-400" />

                  <h3 className="font-bold">
                    Estado de mascotas
                  </h3>

                </div>


                <div className="space-y-4">

                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Pendientes
                    </span>

                    <span className="text-amber-400 font-bold">
                      {
                        mascotas.filter(
                          (m) =>
                            m.estado === "pendiente"
                        ).length
                      }
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Aprobadas
                    </span>

                    <span className="text-emerald-400 font-bold">
                      {
                        mascotas.filter(
                          (m) =>
                            m.estado === "aprobado"
                        ).length
                      }
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Rechazadas
                    </span>

                    <span className="text-red-400 font-bold">
                      {
                        mascotas.filter(
                          (m) =>
                            m.estado === "rechazado"
                        ).length
                      }
                    </span>

                  </div>

                </div>

              </div>


              {/* REFUGIOS */}

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-5">

                  <Building2 className="w-5 h-5 text-[#f4c430]" />

                  <h3 className="font-bold">
                    Estado de refugios
                  </h3>

                </div>


                <div className="space-y-4">

                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Verificados
                    </span>

                    <span className="text-emerald-400 font-bold">
                      {
                        refugios.filter(
                          (r) =>
                            r.refugio_verificado
                        ).length
                      }
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Pendientes
                    </span>

                    <span className="text-amber-400 font-bold">
                      {
                        refugios.filter(
                          (r) =>
                            !r.refugio_verificado
                        ).length
                      }
                    </span>

                  </div>

                </div>

              </div>


              {/* ADOPCIONES */}

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-5">

                  <Heart className="w-5 h-5 text-red-400" />

                  <h3 className="font-bold">
                    Solicitudes de adopción
                  </h3>

                </div>


                <div className="space-y-4">

                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Pendientes
                    </span>

                    <span className="text-amber-400 font-bold">
                      {
                        solicitudes.filter(
                          (s) =>
                            s.estado ===
                            "pendiente"
                        ).length
                      }
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Aprobadas
                    </span>

                    <span className="text-emerald-400 font-bold">
                      {
                        solicitudes.filter(
                          (s) =>
                            s.estado ===
                              "aprobada" ||
                            s.estado ===
                              "finalizada"
                        ).length
                      }
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Rechazadas
                    </span>

                    <span className="text-red-400 font-bold">
                      {
                        solicitudes.filter(
                          (s) =>
                            s.estado ===
                            "rechazada"
                        ).length
                      }
                    </span>

                  </div>

                </div>

              </div>


              {/* USUARIOS */}

              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">

                <div className="flex items-center gap-3 mb-5">

                  <Users className="w-5 h-5 text-blue-400" />

                  <h3 className="font-bold">
                    Usuarios por rol
                  </h3>

                </div>


                <div className="space-y-4">

                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Administradores
                    </span>

                    <span className="text-white font-bold">
                      {
                        usuarios.filter(
                          (u) =>
                            u.rol === "admin"
                        ).length
                      }
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Refugios
                    </span>

                    <span className="text-white font-bold">
                      {
                        usuarios.filter(
                          (u) =>
                            u.rol === "refugio"
                        ).length
                      }
                    </span>

                  </div>


                  <div className="flex justify-between">

                    <span className="text-stone-400">
                      Adoptantes
                    </span>

                    <span className="text-white font-bold">
                      {
                        usuarios.filter(
                          (u) =>
                            u.rol === "adoptante"
                        ).length
                      }
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}