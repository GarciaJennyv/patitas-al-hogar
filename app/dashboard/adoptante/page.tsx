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

interface FormSolicitudState {
  nombresApellidos: string;
  cedula: string;
  telefonoContacto: string;
  fechaNacimiento: string;
  ciudad: string;
  direccion: string;
  tipoVivienda: string;
  condicionVivienda: string;
  tienePatio: string;
  viviendaSegura: string;
  cantPersonas: string;
  tieneNinos: string;
  edadesNinos: string;
  familiaDeAcuerdo: string;
  tuvoMascotasAntes: string;
  tieneMascotasActuales: string;
  detalleMascotasActuales: string;
  motivoAdopcion: string;
  responsablePrincipal: string;
  horasSola: string;
  planMudanza: string;
  aceptaCompromiso: boolean;
}

const initialFormState: FormSolicitudState = {
  nombresApellidos: "",
  cedula: "",
  telefonoContacto: "",
  fechaNacimiento: "",
  ciudad: "",
  direccion: "",
  tipoVivienda: "Casa",
  condicionVivienda: "Propia",
  tienePatio: "No",
  viviendaSegura: "No",
  cantPersonas: "",
  tieneNinos: "No",
  edadesNinos: "",
  familiaDeAcuerdo: "Si",
  tuvoMascotasAntes: "No",
  tieneMascotasActuales: "No",
  detalleMascotasActuales: "",
  motivoAdopcion: "",
  responsablePrincipal: "",
  horasSola: "",
  planMudanza: "",
  aceptaCompromiso: false,
};

export default function AdoptanteDashboardPage() {
  const router = useRouter();

  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [misSolicitudes, setMisSolicitudes] = useState<Solicitud[]>([]);
  const [usuario, setUsuario] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null);
  const [mensajeExito, setMensajeExito] = useState(false);

  // ESTADO UNIFICADO DEL FORMULARIO
  const [formData, setFormData] = useState<FormSolicitudState>(initialFormState);

  useEffect(() => {
    verificarUsuarioYCargarDatos();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

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
      console.error("Error cargando mascotas:", perrosError);
    } else {
      setMascotas(perrosData || []);
    }

    // SOLICITUDES DEL ADOPTANTE
    const { data: solicitudesData, error: solicitudesError } = await supabase
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
      console.error("Error cargando solicitudes:", solicitudesError);
    } else {
      setMisSolicitudes(solicitudesData || []);
    }

    setLoading(false);
  };

  const limpiarFormulario = () => {
    setFormData(initialFormState);
  };

  const cerrarModal = () => {
    setMascotaSeleccionada(null);
    limpiarFormulario();
  };

  // ==========================================================
  // ENVIAR SOLICITUD
  // ==========================================================

  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mascotaSeleccionada || !usuario) return;

    if (!formData.aceptaCompromiso) {
      alert("Debes aceptar el compromiso de adopción.");
      return;
    }

    setEnviando(true);

    try {
      // 1. Verificar duplicados
      const { data: solicitudExistente } = await supabase
        .from("solicitudes_adopcion")
        .select("id")
        .eq("mascota_id", mascotaSeleccionada.id)
        .eq("adoptante_id", usuario.id)
        .maybeSingle();

      if (solicitudExistente) {
        alert("Ya has enviado una solicitud para esta mascota.");
        setEnviando(false);
        return;
      }

      // 2. Insertar solicitud
      const { error } = await supabase.from("solicitudes_adopcion").insert([
        {
          mascota_id: mascotaSeleccionada.id,
          refugio_id: mascotaSeleccionada.refugio_id || mascotaSeleccionada.user_id,
          adoptante_id: usuario.id,
          nombres_apellidos: formData.nombresApellidos,
          cedula: formData.cedula,
          telefono_contacto: formData.telefonoContacto,
          fecha_nacimiento: formData.fechaNacimiento || null,
          ciudad: formData.ciudad,
          direccion: formData.direccion,
          tipo_vivienda: formData.tipoVivienda,
          condicion_vivienda: formData.condicionVivienda,
          tiene_patio: formData.tienePatio==="Si",
          vivienda_segura: formData.viviendaSegura==="Si",
          cant_personas: Number(formData.cantPersonas),
          tiene_ninos: formData.tieneNinos==="Si",
          edades_ninos: formData.tieneNinos === "Si" ? formData.edadesNinos : null ,
          familia_de_acuerdo: formData.familiaDeAcuerdo=== "Si",
          tuvo_mascotas_antes: formData.tuvoMascotasAntes==="Si",
          tiene_mascotas_actuales: formData.tieneMascotasActuales==="Si",
          detalle_mascotas_actuales: formData.tieneMascotasActuales==="Si"
            ? formData.detalleMascotasActuales
            : null,
          motivo_adopcion: formData.motivoAdopcion,
          responsable_principal: formData.responsablePrincipal,
          horas_sola: formData.horasSola,
          plan_mudanza: formData.planMudanza,
          estado: "pendiente",
        },
      ]);

      if (error) throw error;

      setMensajeExito(true);

      setTimeout(() => {
        setMensajeExito(false);
        cerrarModal();
        verificarUsuarioYCargarDatos();
      }, 2000);
    } catch (error: any) {
      console.error(error);
      alert("Error al enviar la solicitud: " + error.message);
    } finally {
      setEnviando(false);
    }
  };

  // ==========================================================
  // CERRAR SESIÓN
  // ==========================================================

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
        <p className="animate-pulse text-stone-400 text-sm">
          Cargando panel de adoptante...
        </p>
      </main>
    );
  }

  const inputClass =
    "w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 text-white text-xs outline-none focus:border-[#f4c430] transition";
  const checkClass =
    "flex items-center gap-2 text-stone-300 cursor-pointer text-xs";

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
            className="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-stone-300 px-4 py-2.5 rounded-xl border border-stone-800 text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>

        {/* MIS SOLICITUDES */}
        {misSolicitudes.length > 0 && (
          <div className="bg-stone-900 border border-stone-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#f4c430]" />
              Mis solicitudes ({misSolicitudes.length})
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
                        {s.mascotas?.nombre || "Mascota"}
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

        {/* CATÁLOGO */}
        <div className="space-y-4">
          <h2 className="text-sm uppercase tracking-wider font-bold text-stone-400 flex items-center gap-2">
            <Dog className="w-4 h-4 text-[#f4c430]" />
            Mascotas disponibles ({mascotas.length})
          </h2>

          {mascotas.length === 0 ? (
            <div className="bg-stone-900 border border-stone-800 p-12 rounded-3xl text-center">
              <Dog className="w-12 h-12 text-stone-600 mx-auto" />
              <p className="text-stone-400 text-sm mt-3">
                No hay mascotas disponibles actualmente.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mascotas.map((mascota) => {
                const postulado = yaPostulado(mascota.id);
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
                        {mascota.raza} • {mascota.edad}
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
                          onClick={() => setMascotaSeleccionada(mascota)}
                          className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition"
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

      {/* MODAL */}
      {mascotaSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 text-stone-100">
            {mensajeExito ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h2 className="text-xl font-bold text-white mt-4">¡Solicitud enviada!</h2>
                <p className="text-sm text-stone-400 mt-2">
                  El refugio revisará tu postulación.
                </p>
              </div>
            ) : (
              <>
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
                  <button onClick={cerrarModal} className="text-stone-400 hover:text-white">
                    <X />
                  </button>
                </div>

                <form onSubmit={enviarSolicitud} className="space-y-5 text-xs">
                  {/* DATOS PERSONALES */}
                  <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-[#f4c430] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      1. Datos personales
                    </h3>
                    <input
                      required
                      name="nombresApellidos"
                      placeholder="Nombres y apellidos"
                      value={formData.nombresApellidos}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        required
                        name="cedula"
                        placeholder="Número de cédula"
                        value={formData.cedula}
                        onChange={handleChange}
                        className={inputClass}
                      />
                      <input
                        required
                        type="tel"
                        name="telefonoContacto"
                        placeholder="Teléfono"
                        value={formData.telefonoContacto}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      <input
                        required
                        type="date"
                        name="fechaNacimiento"
                        value={formData.fechaNacimiento}
                        onChange={handleChange}
                        className={inputClass}
                      />
                      <input
                        required
                        name="ciudad"
                        placeholder="Ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>

                    <input
                      required
                      name="direccion"
                      placeholder="Dirección"
                      value={formData.direccion}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* VIVIENDA */}
                 {/* 2. VIVIENDA */}
<div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">
  <h3 className="font-bold text-[#f4c430] flex items-center gap-2">
    <Home className="w-4 h-4" />
    2. Vivienda
  </h3>

  <div className="grid md:grid-cols-2 gap-3">
    <div>
      <label className="block text-stone-400 mb-1">Tipo de vivienda</label>
      <select
        name="tipoVivienda"
        value={formData.tipoVivienda}
        onChange={handleChange}
        className={inputClass}
      >
        <option value="Casa">Casa</option>
        <option value="Departamento">Departamento</option>
        <option value="Otra">Otra</option>
      </select>
    </div>

    <div>
      <label className="block text-stone-400 mb-1">Condición</label>
      <select
        name="condicionVivienda"
        value={formData.condicionVivienda}
        onChange={handleChange}
        className={inputClass}
      >
        <option value="Propia">Propia</option>
        <option value="Alquilada">Alquilada</option>
        <option value="Familiar">Familiar</option>
      </select>
    </div>
  </div>

  <div className="grid md:grid-cols-2 gap-3">
    <div>
      <label className="block text-stone-400 mb-1">¿La vivienda tiene patio?</label>
      <select
        name="tienePatio"
        value={formData.tienePatio}
        onChange={handleChange}
        className={inputClass}
      >
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>

    <div>
      <label className="block text-stone-400 mb-1">¿Cuenta con cerramiento seguro?</label>
      <select
        name="viviendaSegura"
        value={formData.viviendaSegura}
        onChange={handleChange}
        className={inputClass}
      >
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  </div>
</div>

{/* 3. FAMILIA Y EXPERIENCIA */}
<div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 space-y-4">
  <h3 className="font-bold text-[#f4c430] flex items-center gap-2">
    <Users className="w-4 h-4" />
    3. Familia y experiencia
  </h3>

  <input
    required
    type="number"
    min="1"
    name="cantPersonas"
    placeholder="¿Cuántas personas viven en casa?"
    value={formData.cantPersonas}
    onChange={handleChange}
    className={inputClass}
  />

  <div>
    <label className="block text-stone-400 mb-1">¿Hay niños en casa?</label>
    <select
      name="tieneNinos"
      value={formData.tieneNinos}
      onChange={handleChange}
      className={inputClass}
    >
      <option value="No">No</option>
      <option value="Sí">Sí</option>
    </select>
  </div>

  {formData.tieneNinos === "Sí" && (
    <input
      required
      name="edadesNinos"
      placeholder="Especifica las edades de los niños"
      value={formData.edadesNinos}
      onChange={handleChange}
      className={inputClass}
    />
  )}

  <div>
    <label className="block text-stone-400 mb-1">
      ¿Todos los miembros están de acuerdo con la adopción?
    </label>
    <select
      name="familiaDeAcuerdo"
      value={formData.familiaDeAcuerdo}
      onChange={handleChange}
      className={inputClass}
    >
      <option value="Sí">Sí</option>
      <option value="No">No</option>
    </select>
  </div>

  <div>
    <label className="block text-stone-400 mb-1">
      ¿Has tenido mascotas anteriormente?
    </label>
    <select
      name="tuvoMascotasAntes"
      value={formData.tuvoMascotasAntes}
      onChange={handleChange}
      className={inputClass}
    >
      <option value="Sí">Sí</option>
      <option value="No">No</option>
    </select>
  </div>

  <div>
    <label className="block text-stone-400 mb-1">
      ¿Tienes mascotas actualmente?
    </label>
    <select
      name="tieneMascotasActuales"
      value={formData.tieneMascotasActuales}
      onChange={handleChange}
      className={inputClass}
    >
      <option value="No">No</option>
      <option value="Sí">Sí</option>
    </select>
  </div>

  {formData.tieneMascotasActuales === "Sí" && (
    <textarea
      name="detalleMascotasActuales"
      placeholder="Describe tus mascotas actuales (especie, edad, si están esterilizadas)"
      value={formData.detalleMascotasActuales}
      onChange={handleChange}
      className={inputClass}
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
                      name="motivoAdopcion"
                      placeholder="¿Por qué quieres adoptar?"
                      value={formData.motivoAdopcion}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <input
                      required
                      name="responsablePrincipal"
                      placeholder="¿Quién será el responsable principal?"
                      value={formData.responsablePrincipal}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <input
                      required
                      name="horasSola"
                      placeholder="¿Cuántas horas quedaría sola la mascota?"
                      value={formData.horasSola}
                      onChange={handleChange}
                      className={inputClass}
                    />

                    <textarea
                      required
                      name="planMudanza"
                      placeholder="¿Qué harías en caso de mudanza o viaje?"
                      value={formData.planMudanza}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  {/* COMPROMISO */}
                  <label className="flex items-start gap-3 bg-[#f4c430]/10 border border-[#f4c430]/30 p-4 rounded-2xl cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      name="aceptaCompromiso"
                      checked={formData.aceptaCompromiso}
                      onChange={handleChange}
                      className="mt-1 accent-[#f4c430]"
                    />
                    <span className="text-[#f4c430] font-bold">
                      Acepto ser responsable de la mascota, proporcionarle alimentación,
                      atención veterinaria, cuidados y un hogar seguro.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 font-black py-4 rounded-2xl disabled:opacity-50 cursor-pointer transition"
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
    </main>
  );
}