"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

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
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Phone,
  MapPin,
  Plus,
  Loader2,
  Camera,
} from "lucide-react";

interface Refugio {
  id: string;
  nombre: string;
  ruc_o_identificacion?: string;
  refugio_verificado?: boolean;
  responsable?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  estado: string;
  created_at?: string;
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
  user_id?: string;
}

interface Solicitud {
  id: string;
  mascota_id: string;
  adoptante_id: string;
  refugio_id?: string;
  estado: "pendiente" | "aprobada" | "rechazada" | "finalizada";
  created_at: string;
  mascotas?: { nombre: string };
  adoptante?: { nombre: string };
  refugio?: { nombre: string };
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

const INITIAL_MASCOTA_STATE = {
  refugioId: "",
  nombre: "",
  especie: "Perro",
  raza: "",
  sexo: "Macho",
  edad: "",
  tamano: "Mediano",
  descripcion: "",
  fotoPrincipal: "",
};

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<
    "resumen" | "usuarios" | "refugios" | "mascotas" | "adopciones" | "reportes"
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

  // ESTADOS DEL MODAL CREAR MASCOTA
  const [modalMascotaAbierto, setModalMascotaAbierto] = useState(false);
  const [formMascota, setFormMascota] = useState(INITIAL_MASCOTA_STATE);
  const [guardandoMascota, setGuardandoMascota] = useState(false);
  const [errorMascota, setErrorMascota] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/loginadmin");
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (perfil?.rol !== "admin") {
      await supabase.auth.signOut();
      router.push("/loginadmin");
      return;
    }

    // 1. Usuarios desde profiles
    const { data: usuariosData } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (usuariosData) setUsuarios(usuariosData);

    // 2. Refugios desde profiles (rol = refugio)
    const { data: refugiosData, error: refugiosErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("rol", "refugio");

    if (refugiosErr) console.error("Error refugios:", refugiosErr.message);
    if (refugiosData) {
      setRefugios(refugiosData);
      if (refugiosData.length > 0 && !formMascota.refugioId) {
        setFormMascota((prev) => ({ ...prev, refugioId: refugiosData[0].id }));
      }
    }

    // 3. Mascotas
    const { data: mascotasData } = await supabase.from("mascotas").select("*");
    if (mascotasData) setMascotas(mascotasData as Mascota[]);

    // 4. Solicitudes de Adopción
   const { data: solicitudesData, error: solicitudesErr } = await supabase
  .from("solicitudes_adopcion")
  .select(`
    *,
    mascotas(nombre)
  `)
  .order("created_at", { ascending: false });

if (solicitudesErr) console.error("Error en solicitudes:", solicitudesErr.message);
if (solicitudesData) setSolicitudes(solicitudesData as Solicitud[]);

    if (solicitudesData) setSolicitudes(solicitudesData as Solicitud[]);

    // Métricas
   const solicitudesAprobadas = solicitudesData?.filter((s) => {
      const e = s.estado?.toLowerCase()?.trim();
      return e === "aprobado" || e === "aprobada" || e === "finalizada" || e === "adoptado";
    }) || [];

    const mascotasAdoptadasUnicas = new Set(solicitudesAprobadas.map((s) => s.mascota_id));

    // 2. Asignar las estadísticas corregidas
    setEstadisticas({
      usuarios: usuariosData?.length || 0,
      refugios: refugiosData?.length || 0,
      mascotas: mascotasData?.length || 0,
      adopciones: mascotasAdoptadasUnicas.size,
      solicitudesPendientes:
        solicitudesData?.filter((s) => s.estado?.toLowerCase() === "pendiente").length || 0,
      mascotasPendientes:
        mascotasData?.filter((m) => m.estado?.toLowerCase() === "pendiente").length || 0,
      refugiosPendientes:
        refugiosData?.filter((r) => r.estado?.toLowerCase() === "pendiente").length || 0,
    });

    setLoading(false);
  };
    
  const cambiarEstadoRefugio = async (id: string, nuevoEstado: string) => {
    const { error } = await supabase
      .from("refugios")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (!error) cargarDatos();
  };

  const cambiarEstadoMascota = async (
    id: string,
    nuevoEstado: "aprobado" | "rechazado"
  ) => {
    const { error } = await supabase
      .from("mascotas")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (!error) cargarDatos();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // HANDLERS FORMULARIO MODAL MASCOTA
  const handleFormChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormMascota((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarMascota = async (e: FormEvent) => {
    e.preventDefault();
    setGuardandoMascota(true);
    setErrorMascota(null);

    const targetRefugioId = formMascota.refugioId;

    const { error } = await supabase.from("mascotas").insert([
      {
        refugio_id: targetRefugioId,
        id_refugio: targetRefugioId,
        user_id: targetRefugioId,
        nombre: formMascota.nombre,
        especie: formMascota.especie,
        raza: formMascota.raza || "Mestizo",
        sexo: formMascota.sexo,
        edad: formMascota.edad,
        tamano: formMascota.tamano,
        descripcion: formMascota.descripcion,
        estado: "aprobado",
        fecha_publicacion: new Date().toISOString(),
        foto_principal: formMascota.fotoPrincipal,
        imagen_url: formMascota.fotoPrincipal,
        imagen: formMascota.fotoPrincipal,
      },
    ]);

    setGuardandoMascota(false);

    if (error) {
      setErrorMascota("Error al guardar: " + error.message);
    } else {
      setModalMascotaAbierto(false);
      setFormMascota(INITIAL_MASCOTA_STATE);
      cargarDatos();
    }
  };

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre?.toLowerCase().includes(busquedaUsuario.toLowerCase())
  );

  const refugiosFiltrados = refugios.filter((r) =>
    r.nombre?.toLowerCase().includes(busquedaRefugio.toLowerCase())
  );

  const mascotasFiltradas = mascotas.filter((m) =>
    m.nombre?.toLowerCase().includes(busquedaMascota.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="w-10 h-10 text-[#f4c430] mx-auto mb-4 animate-pulse" />
          <p className="text-stone-400 text-sm">Cargando Panel de Administración...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#f4c430]/10 border border-[#f4c430]/30 p-3 rounded-2xl text-[#f4c430]">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Panel del Administrador</h1>
              <p className="text-xs text-stone-400">Gestión y supervisión general de Patitas al Hogar</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cargarDatos}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-xl border border-stone-800 text-xs font-semibold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" /> Actualizar
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2 rounded-xl border border-stone-800 text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>

        {/* METRICAS PRINCIPALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-stone-400">Total Usuarios</p>
              <p className="text-3xl font-black text-white">{estadisticas.usuarios}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-stone-400">Refugios Registrados</p>
              <p className="text-3xl font-black text-white">{estadisticas.refugios}</p>
            </div>
            <Building2 className="w-8 h-8 text-[#f4c430]" />
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-stone-400">Mascotas Publicadas</p>
              <p className="text-3xl font-black text-white">{estadisticas.mascotas}</p>
            </div>
            <Dog className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-stone-400">Adopciones Concluidas</p>
              <p className="text-3xl font-black text-white">{estadisticas.adopciones}</p>
            </div>
            <Heart className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* NAVEGACION PESTAÑAS */}
        <div className="flex gap-2 overflow-x-auto border-b border-stone-800 pb-1">
          {(["resumen", "usuarios", "refugios", "mascotas", "adopciones", "reportes"] as const).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`capitalize pb-3 px-3 font-bold text-sm border-b-2 transition cursor-pointer ${
                tab === item
                  ? "border-[#f4c430] text-[#f4c430]"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* PESTAÑA: RESUMEN */}
        {tab === "resumen" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">Refugios por Validar</h3>
                </div>
                <p className="text-2xl font-black text-amber-400">{estadisticas.refugiosPendientes}</p>
                <p className="text-xs text-stone-400 mt-1">Refugios en estado pendiente de aprobación.</p>
                <button
                  onClick={() => setTab("refugios")}
                  className="mt-4 text-xs text-[#f4c430] hover:underline font-bold cursor-pointer"
                >
                  Ir a Refugios →
                </button>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white text-sm">Mascotas Pendientes</h3>
                </div>
                <p className="text-2xl font-black text-blue-400">{estadisticas.mascotasPendientes}</p>
                <p className="text-xs text-stone-400 mt-1">Publicaciones en espera de aprobación.</p>
                <button
                  onClick={() => setTab("mascotas")}
                  className="mt-4 text-xs text-[#f4c430] hover:underline font-bold cursor-pointer"
                >
                  Ir a Mascotas →
                </button>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm">Solicitudes Pendientes</h3>
                </div>
                <p className="text-2xl font-black text-emerald-400">{estadisticas.solicitudesPendientes}</p>
                <p className="text-xs text-stone-400 mt-1">Trámites activos entre adoptantes y refugios.</p>
                <button
                  onClick={() => setTab("adopciones")}
                  className="mt-4 text-xs text-[#f4c430] hover:underline font-bold cursor-pointer"
                >
                  Ir a Adopciones →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: USUARIOS */}
        {tab === "usuarios" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Directorio de Usuarios</h2>
                <p className="text-xs text-stone-400">Perfiles registrados en la tabla 'profiles'</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                <input
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-[#f4c430]"
                />
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="divide-y divide-stone-800">
                {usuariosFiltrados.map((u) => (
                  <div key={u.id} className="p-4 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-bold text-white">{u.nombre || "Sin nombre"}</p>
                      <p className="text-xs text-stone-400">{u.email || u.id}</p>
                    </div>
                    <span className="bg-stone-800 text-stone-300 text-xs px-3 py-1 rounded-full font-semibold border border-stone-700 capitalize">
                      {u.rol}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: REFUGIOS */}
        {tab === "refugios" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Validación de Refugios</h2>
                <p className="text-xs text-stone-400">Entidades registradas con rol 'refugio'</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                <input
                  value={busquedaRefugio}
                  onChange={(e) => setBusquedaRefugio(e.target.value)}
                  placeholder="Buscar refugio..."
                  className="bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-[#f4c430]"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {refugiosFiltrados.map((refugio) => (
                <div
                  key={refugio.id}
                  className="bg-stone-900 border border-stone-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{refugio.nombre}</h3>
                      {refugio.estado === "aprobado" ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprobado
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {refugio.estado || "Pendiente"}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400 pt-1">
                      {refugio.responsable && (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-stone-500" /> Responsable: {refugio.responsable}
                        </span>
                      )}
                      {refugio.telefono && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-500" /> {refugio.telefono}
                        </span>
                      )}
                      {(refugio.ciudad || refugio.direccion) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-stone-500" /> {[refugio.ciudad, refugio.direccion].filter(Boolean).join(" - ")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {refugio.estado !== "aprobado" ? (
                      <button
                        onClick={() => cambiarEstadoRefugio(refugio.id, "aprobado")}
                        className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Aprobar
                      </button>
                    ) : (
                      <button
                        onClick={() => cambiarEstadoRefugio(refugio.id, "pendiente")}
                        className="flex items-center gap-1 bg-stone-800 hover:bg-red-900/50 text-red-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-stone-700 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" /> Revocar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PESTAÑA: MASCOTAS */}
        {tab === "mascotas" && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Aprobación y Gestión de Mascotas</h2>
                <p className="text-xs text-stone-400">Moderación y publicación directa en el catálogo</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                  <input
                    value={busquedaMascota}
                    onChange={(e) => setBusquedaMascota(e.target.value)}
                    placeholder="Buscar mascota..."
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-[#f4c430]"
                  />
                </div>

                <button
                  onClick={() => setModalMascotaAbierto(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#f4c430] hover:bg-[#d4a827] text-stone-950 font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" /> Agregar Mascota
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {mascotasFiltradas.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center text-stone-400 text-xs">
                  No se encontraron mascotas registradas.
                </div>
              ) : (
                mascotasFiltradas.map((mascota) => (
                  <div key={mascota.id} className="bg-stone-900 border border-stone-800 p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{mascota.nombre}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          mascota.estado === "aprobado" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" :
                          mascota.estado === "rechazado" ? "bg-red-500/10 text-red-400 border border-red-500/30" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}>
                          {mascota.estado}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1">{mascota.raza} • {mascota.edad}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => cambiarEstadoMascota(mascota.id, "aprobado")} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition cursor-pointer">Aprobar</button>
                      <button onClick={() => cambiarEstadoMascota(mascota.id, "rechazado")} className="bg-red-600 hover:bg-red-500 text-xs font-bold px-3 py-1.5 rounded-lg text-white transition cursor-pointer">Rechazar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: ADOPCIONES */}
        {tab === "adopciones" && (
  <div className="space-y-4">
    <h2 className="text-lg font-bold text-white">Historial de Solicitudes</h2>
    
    {solicitudes.length === 0 ? (
      <div className="bg-stone-900 border border-stone-800 p-8 rounded-2xl text-center text-stone-400 text-xs">
        No hay solicitudes de adopción registradas en el sistema.
      </div>
    ) : (
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden divide-y divide-stone-800">
        {solicitudes.map((s: any) => (
          <div key={s.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-sm">
            <div>
              <p className="font-bold text-white">
                Mascota: {s.mascotas?.nombre || "Mascota no especificada"}
              </p>
              <p className="text-xs text-stone-400">
                Adoptante: {s.nombres_apellidos || s.adoptante?.nombre || "Sin nombre"}
              </p>
              {s.telefono_contacto && (
                <p className="text-xs text-stone-500">Teléfono: {s.telefono_contacto}</p>
              )}
            </div>
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-full font-semibold capitalize">
              {s.estado}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)}
        {/* PESTAÑA: REPORTES */}
        {tab === "reportes" && (
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-[#f4c430]">
              <BarChart3 className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Reportes y Analítica</h2>
            </div>
            <p className="text-xs text-stone-400">Resumen consolidado del sistema</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                <p className="text-stone-400">Tasa de Adopción Concluida</p>
                <p className="text-xl font-bold text-white mt-1">
                  {estadisticas.mascotas > 0 ? ((estadisticas.adopciones / estadisticas.mascotas) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
                <p className="text-stone-400">Proporción de Refugios Aprobados</p>
                <p className="text-xl font-bold text-white mt-1">
                  {estadisticas.refugios > 0 ? (((estadisticas.refugios - estadisticas.refugiosPendientes) / estadisticas.refugios) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PARA AGREGAR MASCOTA */}
      {modalMascotaAbierto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2">
                <Dog className="w-6 h-6 text-[#f4c430]" />
                <h2 className="text-lg font-bold text-white">Publicar Nueva Mascota</h2>
              </div>
              <button
                onClick={() => setModalMascotaAbierto(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMascota && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs">
                {errorMascota}
              </div>
            )}

            <form onSubmit={handleGuardarMascota} className="space-y-4 text-xs">
              {/* ASIGNACIÓN DE REFUGIO */}
              <div>
                <label className="block mb-1 font-medium text-stone-300">Refugio Responsable *</label>
                <select
                  name="refugioId"
                  value={formMascota.refugioId}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                >
                  {refugios.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* CAMPOS BÁSICOS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-stone-300">Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Ej. Luna"
                    value={formMascota.nombre}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-stone-300">Especie *</label>
                  <select
                    name="especie"
                    value={formMascota.especie}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-stone-300">Raza</label>
                  <input
                    type="text"
                    name="raza"
                    placeholder="Ej. Mestizo"
                    value={formMascota.raza}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-stone-300">Sexo *</label>
                  <select
                    name="sexo"
                    value={formMascota.sexo}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-stone-300">Edad *</label>
                  <input
                    type="text"
                    name="edad"
                    required
                    placeholder="Ej. 2 años"
                    value={formMascota.edad}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-stone-300">Tamaño *</label>
                  <select
                    name="tamano"
                    value={formMascota.tamano}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                  >
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label className="block mb-1 font-medium text-stone-300">Descripción *</label>
                <textarea
                  name="descripcion"
                  rows={2}
                  required
                  placeholder="Detalles sobre la mascota..."
                  value={formMascota.descripcion}
                  onChange={handleFormChange}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-2.5 text-white outline-none focus:border-[#f4c430]"
                />
              </div>

              {/* IMAGEN */}
              <div>
                <label className="block mb-1 font-medium text-stone-300">URL de Imagen/Foto *</label>
                <div className="relative">
                  <Camera className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                  <input
                    type="url"
                    name="fotoPrincipal"
                    required
                    placeholder="https://..."
                    value={formMascota.fotoPrincipal}
                    onChange={handleFormChange}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl pl-9 pr-3 py-2.5 text-white outline-none focus:border-[#f4c430]"
                  />
                </div>
              </div>

              {/* ACCIONES */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMascotaAbierto(false)}
                  className="w-1/2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold py-3 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoMascota}
                  className="w-1/2 bg-[#f4c430] hover:bg-[#d4a827] text-stone-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {guardandoMascota ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
                    </>
                  ) : (
                    "Guardar y Publicar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}