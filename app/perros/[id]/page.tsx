"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Heart, Calendar, Dog, Loader2, X, CheckCircle2, Ruler, Check } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function PerroDetallePage({ params }: Props) {
  const resolvedParams = use(params);
  const perroId = resolvedParams.id;
  const supabase = createClient();

  const [perro, setPerro] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  // =========================================================
  // ESTADOS DEL FORMULARIO COMPLETO DE ADOPCIÓN
  // =========================================================
  const [nombres, setNombres] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [direccion, setDireccion] = useState("");
  const [ciudad, setCiudad] = useState("");

  const [tipoVivienda, setTipoVivienda] = useState("Casa");
  const [condicionVivienda, setCondicionVivienda] = useState("Propia");
  const [tienePatio, setTienePatio] = useState(false);
  const [viviendaSegura, setViviendaSegura] = useState(false);

  const [cantPersonas, setCantPersonas] = useState(1);
  const [tieneNinos, setTieneNinos] = useState(false);
  const [edadesNinos, setEdadesNinos] = useState("");
  const [familiaDeAcuerdo, setFamiliaDeAcuerdo] = useState(true);

  const [tuvoMascotasAntes, setTuvoMascotasAntes] = useState(false);
  const [tieneMascotasActuales, setTieneMascotasActuales] = useState(false);
  const [detalleMascotasActuales, setDetalleMascotasActuales] = useState("");
  const [mascotasVacunadas, setMascotasVacunadas] = useState(false);

  const [motivoAdopcion, setMotivoAdopcion] = useState("");
  const [responsablePrincipal, setResponsablePrincipal] = useState("");
  const [horasSola, setHorasSola] = useState("");
  const [planMudanza, setPlanMudanza] = useState("");

  const [compAlimentacion, setCompAlimentacion] = useState(false);
  const [compVeterinario, setCompVeterinario] = useState(false);
  const [compNoAbandono, setCompNoAbandono] = useState(false);
  const [compSeguimiento, setCompSeguimiento] = useState(false);

  const todoComprometido = compAlimentacion && compVeterinario && compNoAbandono && compSeguimiento;

  useEffect(() => {
    async function cargarDetalle() {
      setCargando(true);
      const { data, error } = await supabase
        .from("mascotas")
        .select("*")
        .eq("id", perroId)
        .single();

      if (error) {
        console.error("Error al cargar la mascota:", error);
      } else {
        setPerro(data);
      }
      setCargando(false);
    }

    cargarDetalle();
  }, [perroId]);

  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!todoComprometido) {
      alert("Por favor acepta todos los compromisos antes de enviar la solicitud.");
      return;
    }

    setEnviando(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión para postular a una adopción.");
      setEnviando(false);
      return;
    }

    const { error } = await supabase.from("solicitudes_adopcion").insert([
      {
        mascota_id: perro.id,
        refugio_id: perro.refugio_id || perro.user_id || null,
        adoptante_id: user.id,

        nombres_apellidos: nombres,
        cedula: cedula,
        fecha_nacimiento: fechaNacimiento,
        telefono_contacto: telefonoContacto,
        direccion: direccion,
        ciudad: ciudad,

        tipo_vivienda: tipoVivienda,
        condicion_vivienda: condicionVivienda,
        tiene_patio: tienePatio,
        vivienda_segura: viviendaSegura,

        cant_personas: cantPersonas,
        tiene_ninos: tieneNinos,
        edades_ninos: tieneNinos ? edadesNinos : null,
        familia_de_acuerdo: familiaDeAcuerdo,

        tuvo_mascotas_antes: tuvoMascotasAntes,
        tiene_mascotas_actuales: tieneMascotasActuales,
        detalle_mascotas_actuales: tieneMascotasActuales ? detalleMascotasActuales : null,
        mascotas_vacunadas_esterilizadas: tieneMascotasActuales ? mascotasVacunadas : null,

        motivo_adopcion: motivoAdopcion,
        responsable_principal: responsablePrincipal,
        horas_sola: horasSola,
        plan_mudanza: planMudanza,

        compromiso_alimentacion: compAlimentacion,
        compromiso_veterinario: compVeterinario,
        compromiso_no_abandono: compNoAbandono,
        compromiso_seguimiento: compSeguimiento,

        estado: "pendiente",
      },
    ]);

    setEnviando(false);

    if (error) {
      alert("Hubo un error al enviar tu solicitud: " + error.message);
    } else {
      setMensajeExito(true);
      setTimeout(() => {
        setMensajeExito(false);
        setMostrarModal(false);
      }, 2500);
    }
  };

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-medium">Cargando detalles de la mascota...</span>
      </main>
    );
  }

  if (!perro) {
    return (
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Dog className="w-16 h-16 text-amber-500 mb-4 opacity-80" />
        <h1 className="text-2xl font-bold mb-2 text-slate-800">Mascota no encontrada</h1>
        <p className="text-slate-500 text-sm mb-6">La mascota no existe o fue retirada.</p>
        <Link
          href="/perros"
          className="bg-[#FFB800] hover:bg-[#e6a600] text-slate-950 font-bold px-6 py-2.5 rounded-xl transition text-xs"
        >
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const imgUrl = perro.imagen_url || perro.imagen || perro.foto || "/placeholder.png";

  // Evaluar si la mascota ya fue adoptada/aprobada
  const estadoLimpio = perro.estado?.toLowerCase()?.trim();
  const esAdoptado = estadoLimpio === "adoptado" || estadoLimpio === "adoptada" || estadoLimpio === "aprobado" || estadoLimpio === "aprobada";

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-800">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/perros"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium text-sm transition"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al catálogo
        </Link>

        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl grid grid-cols-1 md:grid-cols-2">
          {/* Imagen y Estado */}
          <div className="relative h-72 md:h-full bg-slate-100 min-h-[360px]">
            <img
              src={imgUrl}
              alt={perro.nombre || "Mascota"}
              className="w-full h-full object-cover"
            />
            {perro.estado && (
              <span className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full shadow-md capitalize ${
                esAdoptado ? "bg-emerald-600 text-white" : "bg-amber-500 text-slate-950"
              }`}>
                {perro.estado}
              </span>
            )}
          </div>

          {/* Datos del Perro */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-start mb-1">
                <h1 className="text-3xl font-black text-slate-900">
                  {perro.nombre || "Sin nombre"}
                </h1>
                {perro.especie && (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                    {perro.especie}
                  </span>
                )}
              </div>

              <p className="text-slate-500 text-sm mb-5 font-medium">
                {perro.raza || "Mestizo"}
              </p>

              {/* Grid con Edad y Tamaño */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                  <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span><strong>Edad:</strong> {perro.edad || "N/A"}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                  <Ruler className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span><strong>Tamaño:</strong> {perro.tamano || perro.tamaño || "Mediano"}</span>
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Descripción
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {perro.descripcion || "Sin descripción proporcionada."}
                </p>
              </div>
            </div>

            {/* Botón de Adopción Condicionado */}
            <div className="pt-4 border-t border-slate-100">
              {esAdoptado ? (
                <button
                  type="button"
                  disabled
                  className="w-full bg-slate-200 text-slate-500 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed text-sm border border-slate-300"
                >
                  <Check className="w-4 h-4 text-slate-500" />
                  <span>Mascota Adoptada</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMostrarModal(true)}
                  className="w-full bg-[#FFB800] hover:bg-[#e6a600] text-slate-950 font-extrabold py-3.5 rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Heart className="w-4 h-4 fill-slate-950" />
                  <span>Solicitar Adopción</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CUESTIONARIO COMPLETO */}
      {mostrarModal && !esAdoptado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {mensajeExito ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-slate-900">¡Solicitud Enviada!</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  El refugio evaluará tus respuestas detalladamente y se pondrá en contacto contigo pronto.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h3 className="font-black text-xl text-slate-900">
                    Formulario de Adopción para {perro.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Por favor completa todos los datos con información real para que el refugio pueda evaluar tu solicitud.
                  </p>
                </div>

                <form onSubmit={enviarSolicitud} className="space-y-6 text-slate-800 text-xs">
                  
                  {/* SECCIÓN 1: DATOS PERSONALES */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>📌</span> 1. Datos Personales
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1">Nombres y Apellidos *</label>
                        <input
                          type="text"
                          required
                          placeholder="Juan Pérez"
                          value={nombres}
                          onChange={(e) => setNombres(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Cédula / Identificación *</label>
                        <input
                          type="text"
                          required
                          placeholder="1712345678"
                          value={cedula}
                          onChange={(e) => setCedula(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Fecha de Nacimiento *</label>
                        <input
                          type="date"
                          required
                          value={fechaNacimiento}
                          onChange={(e) => setFechaNacimiento(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Teléfono de Contacto *</label>
                        <input
                          type="tel"
                          required
                          placeholder="0912345678"
                          value={telefonoContacto}
                          onChange={(e) => setTelefonoContacto(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Ciudad *</label>
                        <input
                          type="text"
                          required
                          placeholder="Quito"
                          value={ciudad}
                          onChange={(e) => setCiudad(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Dirección de Domicilio *</label>
                        <input
                          type="text"
                          required
                          placeholder="Av. Amazonas y Colón"
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: VIVIENDA */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>🏠</span> 2. Información de la Vivienda
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1">Tipo de Vivienda</label>
                        <select
                          value={tipoVivienda}
                          onChange={(e) => setTipoVivienda(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        >
                          <option value="Casa">Casa</option>
                          <option value="Departamento">Departamento</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Condición de la Vivienda</label>
                        <select
                          value={condicionVivienda}
                          onChange={(e) => setCondicionVivienda(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        >
                          <option value="Propia">Propia</option>
                          <option value="Arrienda">Arrienda</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tienePatio}
                          onChange={(e) => setTienePatio(e.target.checked)}
                          className="accent-amber-500 rounded"
                        />
                        <span>¿La vivienda cuenta con patio o jardín?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={viviendaSegura}
                          onChange={(e) => setViviendaSegura(e.target.checked)}
                          className="accent-amber-500 rounded"
                        />
                        <span>¿El perímetro está cerrado/seguro (cerramiento, mallas)?</span>
                      </label>
                    </div>
                  </div>

                  {/* SECCIÓN 3: COMPOSICIÓN FAMILIAR */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>👨‍👩‍👧</span> 3. Composición Familiar
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1">Cantidad de personas en casa</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={cantPersonas}
                          onChange={(e) => setCantPersonas(Number(e.target.value))}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 mt-6 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tieneNinos}
                            onChange={(e) => setTieneNinos(e.target.checked)}
                            className="accent-amber-500 rounded"
                          />
                          <span>¿Viven niños en el hogar?</span>
                        </label>
                      </div>
                    </div>

                    {tieneNinos && (
                      <div>
                        <label className="font-semibold block mb-1">Edades de los niños</label>
                        <input
                          type="text"
                          placeholder="Ej: 5 y 8 años"
                          value={edadesNinos}
                          onChange={(e) => setEdadesNinos(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={familiaDeAcuerdo}
                        onChange={(e) => setFamiliaDeAcuerdo(e.target.checked)}
                        className="accent-amber-500 rounded"
                      />
                      <span>¿Toda la familia está de acuerdo con la adopción?</span>
                    </label>
                  </div>

                  {/* SECCIÓN 4: EXPERIENCIA CON MASCOTAS */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>🐾</span> 4. Experiencia con Mascotas
                    </h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tuvoMascotasAntes}
                          onChange={(e) => setTuvoMascotasAntes(e.target.checked)}
                          className="accent-amber-500 rounded"
                        />
                        <span>¿Ha tenido mascotas anteriormente?</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tieneMascotasActuales}
                          onChange={(e) => setTieneMascotasActuales(e.target.checked)}
                          className="accent-amber-500 rounded"
                        />
                        <span>¿Tiene mascotas actualmente?</span>
                      </label>
                    </div>

                    {tieneMascotasActuales && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="font-semibold block mb-1">Detalle de mascotas actuales (Especie, edad, temperamento)</label>
                          <textarea
                            rows={2}
                            placeholder="Ej: Un perro mestizo de 3 años, muy amigable."
                            value={detalleMascotasActuales}
                            onChange={(e) => setDetalleMascotasActuales(e.target.value)}
                            className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mascotasVacunadas}
                            onChange={(e) => setMascotasVacunadas(e.target.checked)}
                            className="accent-amber-500 rounded"
                          />
                          <span>¿Sus mascotas actuales están vacunadas y esterilizadas?</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN 5: SOBRE LA ADOPCIÓN */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>💡</span> 5. Sobre la Adopción
                    </h4>
                    <div>
                      <label className="font-semibold block mb-1">Motivo por el que desea adoptar *</label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Ej: Deseamos brindar amor a un perrito rescatado y darle un hogar definitivo."
                        value={motivoAdopcion}
                        onChange={(e) => setMotivoAdopcion(e.target.value)}
                        className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold block mb-1">¿Quién será el responsable principal? *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Yo mismo / Mi pareja"
                          value={responsablePrincipal}
                          onChange={(e) => setResponsablePrincipal(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">¿Cuántas horas al día pasará sola la mascota? *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: 4 horas"
                          value={horasSola}
                          onChange={(e) => setHorasSola(e.target.value)}
                          className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">¿Qué pasará con la mascota si viaja o se muda? *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: La llevaré conmigo / La cuidarán mis familiares."
                        value={planMudanza}
                        onChange={(e) => setPlanMudanza(e.target.value)}
                        className="w-full border border-slate-300 p-2.5 rounded-xl focus:outline-none focus:border-[#FFB800] bg-white"
                      />
                    </div>
                  </div>

                  {/* SECCIÓN 6: COMPROMISOS */}
                  <div className="space-y-3 bg-amber-50/60 border border-amber-200/80 p-4 rounded-2xl">
                    <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                      <span>📜</span> 6. Compromisos de Adopción
                    </h4>
                    <div className="space-y-2 text-slate-800">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={compAlimentacion}
                          onChange={(e) => setCompAlimentacion(e.target.checked)}
                          className="accent-amber-500 rounded mt-0.5"
                        />
                        <span>Me comprometo a brindar alimentación adecuada, espacio seguro y afecto.</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={compVeterinario}
                          onChange={(e) => setCompVeterinario(e.target.checked)}
                          className="accent-amber-500 rounded mt-0.5"
                        />
                        <span>Me comprometo a cubrir sus gastos veterinarios (vacunas, desparasitación, atención médica).</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={compNoAbandono}
                          onChange={(e) => setCompNoAbandono(e.target.checked)}
                          className="accent-amber-500 rounded mt-0.5"
                        />
                        <span>Me comprometo a no abandonarla ni regalarla sin previa notificación al refugio.</span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          required
                          checked={compSeguimiento}
                          onChange={(e) => setCompSeguimiento(e.target.checked)}
                          className="accent-amber-500 rounded mt-0.5"
                        />
                        <span>Acepto recibir visitas o seguimiento periódico por parte del refugio.</span>
                      </label>
                    </div>
                  </div>

                  {/* BOTÓN SUBMIT */}
                  <button
                    type="submit"
                    disabled={enviando || !todoComprometido}
                    className="w-full bg-[#FFB800] hover:bg-[#e6a600] text-slate-950 font-extrabold py-3.5 rounded-2xl text-sm transition disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {enviando ? "Guardando y enviando..." : "Enviar Solicitud a Evaluación"}
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