"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Heart,
  LogOut,
  User,
  Dog,
  CheckCircle2,
  X,
  FileText,
  Home,
  Users,
  ClipboardCheck,
} from "lucide-react";

const supabase = createClient();

interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  edad: string;
  tamano: string;
  peso: string;
  descripcion: string;
  imagen: string;
  imagen_url: string;
  estado: string;
  estado_adopcion: string;
  user_id: string;
  refugio_id: string;
}

interface Solicitud {
  id: string;
  mascota_id: string;
  refugio_id: string;
  adoptante_id: string;
  estado: string;
  created_at: string;
  mascotas?: {
    nombre: string;
    imagen: string;
    imagen_url: string;
  };
}

export default function AdoptanteDashboardPage() {
  const router = useRouter();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [misSolicitudes, setMisSolicitudes] = useState<Solicitud[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [mascotaSeleccionada, setMascotaSeleccionada] =
    useState<Mascota | null>(null);

  const [mensajeExito, setMensajeExito] = useState(false);

  // DATOS PERSONALES
  const [nombresApellidos, setNombresApellidos] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");

  // VIVIENDA
  const [tipoVivienda, setTipoVivienda] = useState("Casa");
  const [condicionVivienda, setCondicionVivienda] =
    useState("Propia");
  const [tienePatio, setTienePatio] = useState(false);
  const [viviendaSegura, setViviendaSegura] = useState(false);

  // FAMILIA
  const [cantPersonas, setCantPersonas] = useState("");
  const [tieneNinos, setTieneNinos] = useState(false);
  const [edadesNinos, setEdadesNinos] = useState("");
  const [familiaDeAcuerdo, setFamiliaDeAcuerdo] = useState(false);

  // EXPERIENCIA
  const [tuvoMascotasAntes, setTuvoMascotasAntes] = useState(false);
  const [tieneMascotasActuales, setTieneMascotasActuales] =
    useState(false);
  const [detalleMascotasActuales, setDetalleMascotasActuales] =
    useState("");

  // ADOPCIÓN
  const [motivoAdopcion, setMotivoAdopcion] = useState("");
  const [responsablePrincipal, setResponsablePrincipal] =
    useState("");
  const [horasSola, setHorasSola] = useState("");
  const [planMudanza, setPlanMudanza] = useState("");

  const [aceptaCompromiso, setAceptaCompromiso] = useState(false);

  useEffect(() => {
    verificarUsuarioYCargarDatos();
  }, []);

  // ==========================================================
  // CARGAR USUARIO, MASCOTAS Y SOLICITUDES
  // ==========================================================

  const verificarUsuarioYCargarDatos = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUsuario(user);

    // MASCOTAS APROBADAS Y DISPONIBLES
    const { data: perrosData, error: perrosError } = await supabase
      .from("mascotas")
      .select("*")
      .eq("estado", "aprobado")
      .eq("estado_adopcion", "Disponible")
      .order("created_at", { ascending: false });

    if (perrosError) {
      console.error(
        "Error cargando mascotas:",
        perrosError
      );
    } else {
      setMascotas(perrosData || []);
    }

    // SOLICITUDES DEL ADOPTANTE
    const { data: solicitudesData, error: solicitudesError } =
      await supabase
        .from("solicitudes_adopcion")
        .select(
          `
          *,
          mascotas (
            nombre,
            imagen,
            imagen_url
          )
        `
        )
        .eq("adoptante_id", user.id)
        .order("created_at", { ascending: false });

    if (solicitudesError) {
      console.error(
        "Error cargando solicitudes:",
        solicitudesError
      );
    } else {
      setMisSolicitudes(solicitudesData || []);
    }

    setLoading(false);
  };

  // ==========================================================
  // LIMPIAR FORMULARIO
  // ==========================================================

  const limpiarFormulario = () => {
    setNombresApellidos("");
    setCedula("");
    setTelefonoContacto("");
    setFechaNacimiento("");
    setCiudad("");
    setDireccion("");

    setTipoVivienda("Casa");
    setCondicionVivienda("Propia");
    setTienePatio(false);
    setViviendaSegura(false);

    setCantPersonas("");
    setTieneNinos(false);
    setEdadesNinos("");
    setFamiliaDeAcuerdo(false);

    setTuvoMascotasAntes(false);
    setTieneMascotasActuales(false);
    setDetalleMascotasActuales("");

    setMotivoAdopcion("");
    setResponsablePrincipal("");
    setHorasSola("");
    setPlanMudanza("");

    setAceptaCompromiso(false);
  };

  const cerrarModal = () => {
    setMascotaSeleccionada(null);
    limpiarFormulario();
  };

  // ==========================================================
  // ENVIAR SOLICITUD
  // ==========================================================

  const enviarSolicitud = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!mascotaSeleccionada || !usuario) {
      return;
    }

    if (!aceptaCompromiso) {
      alert(
        "Debes aceptar el compromiso de adopción."
      );
      return;
    }

    setEnviando(true);

    // Verificar si ya existe una solicitud
    const { data: solicitudExistente } = await supabase
      .from("solicitudes_adopcion")
      .select("id")
      .eq("mascota_id", mascotaSeleccionada.id)
      .eq("adoptante_id", usuario.id)
      .maybeSingle();

    if (solicitudExistente) {
      alert(
        "Ya has enviado una solicitud para esta mascota."
      );
      setEnviando(false);
      return;
    }

    const { error } = await supabase
      .from("solicitudes_adopcion")
      .insert([
        {
          mascota_id: mascotaSeleccionada.id,
          refugio_id:
            mascotaSeleccionada.refugio_id ||
            mascotaSeleccionada.user_id,

          adoptante_id: usuario.id,

          nombres_apellidos: nombresApellidos,
          cedula: cedula,
          telefono_contacto: telefonoContacto,
          fecha_nacimiento: fechaNacimiento || null,
          ciudad: ciudad,
          direccion: direccion,

          tipo_vivienda: tipoVivienda,
          condicion_vivienda: condicionVivienda,
          tiene_patio: tienePatio,
          vivienda_segura: viviendaSegura,

          cant_personas: Number(cantPersonas),
          tiene_ninos: tieneNinos,
          edades_ninos: tieneNinos
            ? edadesNinos
            : null,

          familia_de_acuerdo: familiaDeAcuerdo,

          tuvo_mascotas_antes:
            tuvoMascotasAntes,

          tiene_mascotas_actuales:
            tieneMascotasActuales,

          detalle_mascotas_actuales:
            tieneMascotasActuales
              ? detalleMascotasActuales
              : null,

          motivo_adopcion: motivoAdopcion,
          responsable_principal:
            responsablePrincipal,

          horas_sola: horasSola,
          plan_mudanza: planMudanza,

          estado: "pendiente",
        },
      ]);

    setEnviando(false);

    if (error) {
      console.error(error);

      alert(
        "Error al enviar la solicitud: " +
          error.message
      );

      return;
    }

    setMensajeExito(true);

    setTimeout(() => {
      setMensajeExito(false);
      cerrarModal();
      verificarUsuarioYCargarDatos();
    }, 2000);
  };

  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // ==========================================================
  // SABER SI YA POSTULÓ
  // ==========================================================

  const yaPostulado = (mascotaId: string) => {
    return misSolicitudes.some(
      (s) => s.mascota_id === mascotaId
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-950 text-white flex items-center justify-center">
        <p className="animate-pulse text-stone-400 text-sm">
          Cargando panel de adoptante...
        </p>
      </main>
    );
  }

  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-6 md:p-10 pb-24">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* =====================================================
            ENCABEZADO
        ===================================================== */}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-6">

          <div className="flex items-center gap-3">

            <div className="bg-[#f4c430]/10 border border-[#f4c430]/30 p-3 rounded-2xl text-[#f4c430]">
              <User className="w-8 h-8" />
            </div>

            <div>

              <h1 className="text-2xl font-black text-white">
                Panel de Adoptante
              </h1>

              <p className="text-xs text-stone-400">
                Bienvenido,{" "}
                <span className="text-stone-200">
                  {usuario?.email}
                </span>
              </p>

            </div>

          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2.5 rounded-xl border border-stone-800 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>

        </div>

        {/* =====================================================
            MIS SOLICITUDES
        ===================================================== */}

        {misSolicitudes.length > 0 && (

          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">

            <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400 flex items-center gap-2">

              <FileText className="w-4 h-4 text-[#f4c430]" />

              Mis solicitudes (
              {misSolicitudes.length}
              )

            </h2>

            <div className="grid md:grid-cols-2 gap-3">

              {misSolicitudes.map((s) => {

                const img =
                  s.mascotas?.imagen_url ||
                  s.mascotas?.imagen ||
                  "/placeholder.png";

                return (

                  <div
                    key={s.id}
                    className="bg-stone-950 border border-stone-800 p-3 rounded-2xl flex items-center gap-3"
                  >

                    <img
                      src={img}
                      alt={s.mascotas?.nombre}
                      className="w-14 h-14 rounded-xl object-cover"
                    />

                    <div className="flex-1">

                      <p className="font-bold text-white text-sm">
                        {s.mascotas?.nombre ||
                          "Mascota"}
                      </p>

                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          s.estado === "aprobada"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : s.estado === "rechazada"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {s.estado}
                      </span>

                    </div>

                  </div>

                );
              })}

            </div>

          </div>

        )}

        {/* =====================================================
            CATÁLOGO
        ===================================================== */}

        <div className="space-y-4">

          <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400 flex items-center gap-2">

            <Dog className="w-4 h-4 text-[#f4c430]" />

            Mascotas disponibles ({mascotas.length})

          </h2>

          {mascotas.length === 0 ? (

            <div className="bg-stone-900 border border-stone-800 p-12 rounded-3xl text-center">

              <Dog className="w-12 h-12 text-stone-600 mx-auto" />

              <p className="text-stone-400 text-sm mt-3">
                No hay mascotas disponibles
                actualmente.
              </p>

            </div>

          ) : (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {mascotas.map((mascota) => {

                const postulado =
                  yaPostulado(mascota.id);

                const imagen =
                  mascota.imagen_url ||
                  mascota.imagen ||
                  "/placeholder.png";

                return (

                  <div
                    key={mascota.id}
                    className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col"
                  >

                    <div className="relative h-56 bg-stone-950">

                      <img
                        src={imagen}
                        alt={mascota.nombre}
                        className="w-full h-full object-cover"
                      />

                      <span className="absolute top-3 right-3 bg-stone-950/80 text-[#f4c430] border border-[#f4c430]/30 text-[10px] font-bold px-3 py-1 rounded-full">
                        {mascota.tamano}
                      </span>

                    </div>

                    <div className="p-5 flex-1">

                      <h3 className="font-extrabold text-white text-xl">
                        {mascota.nombre}
                      </h3>

                      <p className="text-xs text-stone-400 mt-1">
                        {mascota.raza} •{" "}
                        {mascota.edad}
                      </p>

                      <p className="text-xs text-stone-400 mt-3 line-clamp-3">
                        {mascota.descripcion}
                      </p>

                    </div>

                    <div className="p-5 pt-0">

                      {postulado ? (

                        <button
                          disabled
                          className="w-full bg-stone-800 text-emerald-400 border border-emerald-500/30 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2"
                        >

                          <CheckCircle2 className="w-4 h-4" />

                          Ya postulaste

                        </button>

                      ) : (

                        <button
                          onClick={() =>
                            setMascotaSeleccionada(
                              mascota
                            )
                          }
                          className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >

                          <Heart className="w-4 h-4 fill-stone-950" />

                          Postular para Adopción

                        </button>

                      )}

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {mascotaSeleccionada && (

        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 text-stone-100">

            {mensajeExito ? (

              <div className="py-12 text-center">

                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />

                <h2 className="text-xl font-bold text-white mt-4">
                  ¡Solicitud enviada!
                </h2>

                <p className="text-sm text-stone-400 mt-2">
                  El refugio revisará tu
                  postulación.
                </p>

              </div>

            ) : (

              <>

                {/* CABECERA */}

                <div className="flex justify-between items-start mb-6">

                  <div>

                    <h2 className="text-xl font-black text-white">
                      Solicitud de adopción
                    </h2>

                    <p className="text-xs text-stone-400">
                      Mascota:{" "}
                      <strong className="text-[#f4c430]">
                        {mascotaSeleccionada.nombre}
                      </strong>
                    </p>

                  </div>

                  <button
                    onClick={cerrarModal}
                    className="text-stone-400 hover:text-white"
                  >
                    <X />
                  </button>

                </div>

                <form
                  onSubmit={enviarSolicitud}
                  className="space-y-5 text-xs"
                >

                  {/* DATOS PERSONALES */}

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">

                    <h3 className="font-bold text-[#f4c430] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      1. Datos personales
                    </h3>

                    <input
                      required
                      placeholder="Nombres y apellidos"
                      value={nombresApellidos}
                      onChange={(e) =>
                        setNombresApellidos(
                          e.target.value
                        )
                      }
                      className="campo"
                    />

                    <div className="grid md:grid-cols-2 gap-3">

                      <input
                        required
                        placeholder="Número de cédula"
                        value={cedula}
                        onChange={(e) =>
                          setCedula(e.target.value)
                        }
                        className="campo"
                      />

                      <input
                        required
                        type="tel"
                        placeholder="Teléfono"
                        value={telefonoContacto}
                        onChange={(e) =>
                          setTelefonoContacto(
                            e.target.value
                          )
                        }
                        className="campo"
                      />

                    </div>

                    <div className="grid md:grid-cols-2 gap-3">

                      <input
                        required
                        type="date"
                        value={fechaNacimiento}
                        onChange={(e) =>
                          setFechaNacimiento(
                            e.target.value
                          )
                        }
                        className="campo"
                      />

                      <input
                        required
                        placeholder="Ciudad"
                        value={ciudad}
                        onChange={(e) =>
                          setCiudad(e.target.value)
                        }
                        className="campo"
                      />

                    </div>

                    <input
                      required
                      placeholder="Dirección"
                      value={direccion}
                      onChange={(e) =>
                        setDireccion(e.target.value)
                      }
                      className="campo"
                    />

                  </div>

                  {/* VIVIENDA */}

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">

                    <h3 className="font-bold text-[#f4c430] flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      2. Vivienda
                    </h3>

                    <select
                      value={tipoVivienda}
                      onChange={(e) =>
                        setTipoVivienda(
                          e.target.value
                        )
                      }
                      className="campo"
                    >
                      <option>Casa</option>
                      <option>Departamento</option>
                      <option>Otra</option>
                    </select>

                    <select
                      value={condicionVivienda}
                      onChange={(e) =>
                        setCondicionVivienda(
                          e.target.value
                        )
                      }
                      className="campo"
                    >
                      <option>Propia</option>
                      <option>Alquilada</option>
                      <option>Familiar</option>
                    </select>

                    <label className="check">
                      <input
                        type="checkbox"
                        checked={tienePatio}
                        onChange={(e) =>
                          setTienePatio(
                            e.target.checked
                          )
                        }
                      />
                      ¿La vivienda tiene patio?
                    </label>

                    <label className="check">
                      <input
                        type="checkbox"
                        checked={viviendaSegura}
                        onChange={(e) =>
                          setViviendaSegura(
                            e.target.checked
                          )
                        }
                      />
                      ¿La vivienda cuenta con cerramiento
                      seguro?
                    </label>

                  </div>

                  {/* FAMILIA */}

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">

                    <h3 className="font-bold text-[#f4c430] flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      3. Familia y experiencia
                    </h3>

                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="¿Cuántas personas viven en casa?"
                      value={cantPersonas}
                      onChange={(e) =>
                        setCantPersonas(
                          e.target.value
                        )
                      }
                      className="campo"
                    />

                    <label className="check">
                      <input
                        type="checkbox"
                        checked={tieneNinos}
                        onChange={(e) =>
                          setTieneNinos(
                            e.target.checked
                          )
                        }
                      />
                      ¿Hay niños en casa?
                    </label>

                    {tieneNinos && (

                      <input
                        required
                        placeholder="Edades de los niños"
                        value={edadesNinos}
                        onChange={(e) =>
                          setEdadesNinos(
                            e.target.value
                          )
                        }
                        className="campo"
                      />

                    )}

                    <label className="check">
                      <input
                        type="checkbox"
                        checked={familiaDeAcuerdo}
                        onChange={(e) =>
                          setFamiliaDeAcuerdo(
                            e.target.checked
                          )
                        }
                      />
                      Todos los miembros de la familia
                      están de acuerdo con la adopción
                    </label>

                    <label className="check">
                      <input
                        type="checkbox"
                        checked={tuvoMascotasAntes}
                        onChange={(e) =>
                          setTuvoMascotasAntes(
                            e.target.checked
                          )
                        }
                      />
                      ¿Has tenido mascotas anteriormente?
                    </label>

                    <label className="check">
                      <input
                        type="checkbox"
                        checked={tieneMascotasActuales}
                        onChange={(e) =>
                          setTieneMascotasActuales(
                            e.target.checked
                          )
                        }
                      />
                      ¿Tienes mascotas actualmente?
                    </label>

                    {tieneMascotasActuales && (

                      <textarea
                        placeholder="Describe tus mascotas actuales"
                        value={
                          detalleMascotasActuales
                        }
                        onChange={(e) =>
                          setDetalleMascotasActuales(
                            e.target.value
                          )
                        }
                        className="campo"
                      />

                    )}

                  </div>

                  {/* ADOPCIÓN */}

                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">

                    <h3 className="font-bold text-[#f4c430] flex items-center gap-2">
                      <ClipboardCheck className="w-4 h-4" />
                      4. Sobre la adopción
                    </h3>

                    <textarea
                      required
                      placeholder="¿Por qué quieres adoptar?"
                      value={motivoAdopcion}
                      onChange={(e) =>
                        setMotivoAdopcion(
                          e.target.value
                        )
                      }
                      className="campo"
                    />

                    <input
                      required
                      placeholder="¿Quién será el responsable principal?"
                      value={responsablePrincipal}
                      onChange={(e) =>
                        setResponsablePrincipal(
                          e.target.value
                        )
                      }
                      className="campo"
                    />

                    <input
                      required
                      placeholder="¿Cuántas horas quedaría sola la mascota?"
                      value={horasSola}
                      onChange={(e) =>
                        setHorasSola(
                          e.target.value
                        )
                      }
                      className="campo"
                    />

                    <textarea
                      required
                      placeholder="¿Qué harías en caso de mudanza o viaje?"
                      value={planMudanza}
                      onChange={(e) =>
                        setPlanMudanza(
                          e.target.value
                        )
                      }
                      className="campo"
                    />

                  </div>

                  {/* COMPROMISO */}

                  <label className="flex items-start gap-3 bg-[#f4c430]/10 border border-[#f4c430]/30 p-4 rounded-2xl cursor-pointer">

                    <input
                      type="checkbox"
                      required
                      checked={aceptaCompromiso}
                      onChange={(e) =>
                        setAceptaCompromiso(
                          e.target.checked
                        )
                      }
                      className="mt-1 accent-[#f4c430]"
                    />

                    <span className="text-[#f4c430] font-bold">
                      Acepto ser responsable de la mascota,
                      proporcionarle alimentación, atención
                      veterinaria, cuidados y un hogar seguro.
                    </span>

                  </label>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-black py-4 rounded-2xl disabled:opacity-50 cursor-pointer"
                  >
                    {enviando
                      ? "Enviando solicitud..."
                      : "Enviar solicitud de adopción"}
                  </button>

                </form>

              </>

            )}

          </div>

        </div>

      )}

      {/* ESTILOS PARA LOS INPUTS */}

      <style jsx>{`
        .campo {
          width: 100%;
          background: #0c0a09;
          border: 1px solid #292524;
          border-radius: 12px;
          padding: 10px 12px;
          color: white;
          outline: none;
        }

        .campo:focus {
          border-color: #f4c430;
        }

        .check {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #d6d3d1;
          cursor: pointer;
        }

        .check input {
          accent-color: #f4c430;
        }
      `}</style>

    </main>
  );
}