"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  Heart, 
  LogOut, 
  User, 
  Dog, 
  CheckCircle2, 
  X, 
  FileText 
} from "lucide-react";

interface Mascota {
  id: string;
  nombre: string;
  raza: string;
  edad: string;
  tamanio: string;
  descripcion: string;
  imagen: string;
  user_id: string;
}

interface Solicitud {
  id: string;
  mascota_id: string;
  estado: string;
  created_at: string;
}

export default function AdoptanteDashboardPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [misSolicitudes, setMisSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState<any>(null);
  
  // Estado para el modal de postulación
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null);
  const [tipoVivienda, setTipoVivienda] = useState("Casa");
  const [viviendaPropia, setViviendaPropia] = useState(false);
  const [permiteMascotas, setPermiteMascotas] = useState(true);
  const [tienePatioCerrado, setTienePatioCerrado] = useState(false);
  const [aceptaCompromiso, setAceptaCompromiso] = useState(false);
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  const router = useRouter();

  useEffect(() => {
    verificarUsuarioYCargarDatos();
  }, []);

  const verificarUsuarioYCargarDatos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUsuario(user);

    const { data: perrosData } = await supabase
      .from("mascotas")
      .select("*")
      .eq("estado", "aprobado");

    if (perrosData) setMascotas(perrosData);

    const { data: solicitudesData } = await supabase
      .from("solicitudes_adopcion")
      .select("*")
      .eq("adoptante_id", user.id);

    if (solicitudesData) setMisSolicitudes(solicitudesData);

    setLoading(false);
  };

  const cerrarModal = () => {
    setMascotaSeleccionada(null);
    setTelefonoContacto("");
    setTipoVivienda("Casa");
    setViviendaPropia(false);
    setPermiteMascotas(true);
    setTienePatioCerrado(false);
    setAceptaCompromiso(false);
  };

  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mascotaSeleccionada || !usuario || !aceptaCompromiso) return;

    setEnviando(true);

    const { error } = await supabase.from("solicitudes_adopcion").insert([
      {
        mascota_id: mascotaSeleccionada.id,
        refugio_id: mascotaSeleccionada.user_id,
        adoptante_id: usuario.id,
        tipo_vivienda: tipoVivienda,
        vivienda_propia: viviendaPropia,
        permite_mascotas: permiteMascotas,
        tiene_patio_cerrado: tienePatioCerrado,
        telefono_contacto: telefonoContacto,
        estado: "pendiente",
      },
    ]);

    setEnviando(false);

    if (error) {
      alert("Error al procesar la solicitud: " + error.message);
    } else {
      setMensajeExito(true);
      setTimeout(() => {
        setMensajeExito(false);
        cerrarModal();
        verificarUsuarioYCargarDatos();
      }, 2000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const yaPostulado = (mascotaId: string) => {
    return misSolicitudes.some((s) => s.mascota_id === mascotaId);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <p className="animate-pulse text-stone-400 text-sm">Cargando panel de adoptante...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#f4c430]/10 border border-[#f4c430]/30 p-3 rounded-2xl text-[#f4c430]">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Panel de Adoptante</h1>
              <p className="text-xs text-stone-400">
                Bienvenido, <span className="text-stone-200">{usuario?.email}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="self-start md:self-auto flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2.5 rounded-xl border border-stone-800 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>

        {/* MIS POSTULACIONES EN CURSO */}
        {misSolicitudes.length > 0 && (
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-3">
            <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#f4c430]" /> Estado de tus solicitudes ({misSolicitudes.length})
            </h2>
            <div className="flex flex-wrap gap-3">
              {misSolicitudes.map((s) => (
                <div key={s.id} className="bg-stone-950 border border-stone-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs">
                  <Dog className="w-4 h-4 text-stone-400" />
                  <span className="text-stone-300 font-semibold">Solicitud ID: {s.id.substring(0, 6)}...</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    s.estado === "aprobado" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                    s.estado === "rechazado" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                    "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}>
                    {s.estado}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATÁLOGO DE PERROS EN ADOPCIÓN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400 flex items-center gap-2">
              <Dog className="w-4 h-4 text-[#f4c430]" /> Catálogo de Mascotas Disponibles ({mascotas.length})
            </h2>
          </div>

          {mascotas.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 p-12 rounded-3xl text-center space-y-2">
              <Dog className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-400 text-sm">No hay perritos disponibles para adopción en este momento.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mascotas.map((mascota) => {
                const postulado = yaPostulado(mascota.id);

                return (
                  <div
                    key={mascota.id}
                    className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col justify-between"
                  >
                    <div className="relative h-52 bg-stone-950">
                      <img
                        src={mascota.imagen}
                        alt={mascota.nombre}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 right-3 bg-stone-950/80 text-[#f4c430] border border-[#f4c430]/30 text-[10px] font-extrabold uppercase px-3 py-1 rounded-full backdrop-blur-md">
                        {mascota.tamanio}
                      </span>
                    </div>

                    <div className="p-5 space-y-2 flex-grow">
                      <h3 className="font-extrabold text-white text-xl">{mascota.nombre}</h3>
                      <p className="text-xs text-stone-400">
                        Raza: <strong className="text-stone-200">{mascota.raza}</strong> • Edad: <strong className="text-stone-200">{mascota.edad}</strong>
                      </p>
                      <p className="text-xs text-stone-400 line-clamp-2 pt-1">{mascota.descripcion}</p>
                    </div>

                    <div className="p-5 pt-0">
                      {postulado ? (
                        <button
                          disabled
                          className="w-full bg-stone-800 text-emerald-400 border border-emerald-500/30 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Ya enviaste postulación
                        </button>
                      ) : (
                        <button
                          onClick={() => setMascotaSeleccionada(mascota)}
                          className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-stone-950" /> Postular para Adopción
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL CUESTIONARIO DE REQUISITOS */}
        {mascotaSeleccionada && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full relative space-y-4 max-h-[90vh] overflow-y-auto text-stone-100">
              
              <button
                onClick={cerrarModal}
                className="absolute top-4 right-4 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {mensajeExito ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h3 className="text-lg font-bold text-white">¡Solicitud Enviada!</h3>
                  <p className="text-xs text-stone-400">
                    Tu postulación para <strong>{mascotaSeleccionada.nombre}</strong> fue recibida correctamente. El refugio la revisará pronto.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="font-extrabold text-lg text-white">
                      Postular para adoptar a {mascotaSeleccionada.nombre}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Responde este breve cuestionario para que el refugio evalúe tu perfil.
                    </p>
                  </div>

                  <form onSubmit={enviarSolicitud} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-stone-300 block mb-1">Teléfono de Contacto</label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 0912345678"
                        value={telefonoContacto}
                        onChange={(e) => setTelefonoContacto(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#f4c430]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-300 block mb-1">Tipo de vivienda</label>
                      <select
                        value={tipoVivienda}
                        onChange={(e) => setTipoVivienda(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#f4c430]"
                      >
                        <option value="Casa">Casa</option>
                        <option value="Departamento">Departamento</option>
                      </select>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={viviendaPropia}
                          onChange={(e) => setViviendaPropia(e.target.checked)}
                          className="accent-[#f4c430]"
                        />
                        <span className="text-stone-300">¿La vivienda es propia?</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={permiteMascotas}
                          onChange={(e) => setPermiteMascotas(e.target.checked)}
                          className="accent-[#f4c430]"
                        />
                        <span className="text-stone-300">¿Tienes permiso para tener mascotas en el inmueble?</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tienePatioCerrado}
                          onChange={(e) => setTienePatioCerrado(e.target.checked)}
                          className="accent-[#f4c430]"
                        />
                        <span className="text-stone-300">¿Cuenta con patio cerrado / seguro?</span>
                      </label>

                      <label className="flex items-center gap-2 font-bold text-[#f4c430] pt-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          required 
                          checked={aceptaCompromiso}
                          onChange={(e) => setAceptaCompromiso(e.target.checked)}
                          className="accent-[#f4c430]" 
                        />
                        <span>Acepto el compromiso de esterilización y visitas de seguimiento.</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={enviando || !aceptaCompromiso}
                      className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-bold py-3 rounded-xl transition disabled:opacity-50 cursor-pointer"
                    >
                      {enviando ? "Enviando..." : "Enviar Postulación"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}