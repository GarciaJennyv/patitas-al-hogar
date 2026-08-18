"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle, XCircle, Eye, FileText, User, Home, HeartHandshake } from "lucide-react";

export default function RefugioSolicitudesPage() {
  const supabase = createClient();

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<any>(null);
  const [actualizando, setActualizando] = useState(false);

  // Cargar solicitudes del refugio actual
  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    setCargando(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setCargando(false);
      return;
    }

    // Traemos las solicitudes uniendo la tabla 'mascotas' para ver la foto/nombre del animal
    const { data, error } = await supabase
      .from("solicitudes_adopcion")
      .select(`
        *,
        mascotas (
          nombre,
          imagen_url,
          imagen,
          especie
        )
      `)
      .eq("refugio_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando solicitudes:", error);
    } else {
      setSolicitudes(data || []);
    }
    setCargando(false);
  };

  // Cambiar estado de la solicitud (Aprobar / Rechazar)
  const cambiarEstado = async (id: string, nuevoEstado: "aprobada" | "rechazada") => {
    setActualizando(true);

    const { error } = await supabase
      .from("solicitudes_adopcion")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    setActualizando(false);

    if (error) {
      alert("Error al actualizar estado: " + error.message);
    } else {
      alert(`Solicitud ${nuevoEstado === "aprobada" ? "aprobada" : "rechazada"} con éxito.`);
      setSolicitudSeleccionada(null);
      cargarSolicitudes(); // Recargar la lista
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-sm font-medium">Cargando solicitudes recibidas...</span>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Solicitudes de Adopción Recibidas</h1>
          <p className="text-xs text-slate-500">
            Revisa las postulaciones de adoptantes para las mascotas de tu refugio.
          </p>
        </div>

        {solicitudes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-3">
            <HeartHandshake className="w-12 h-12 text-amber-400 mx-auto opacity-70" />
            <h3 className="font-bold text-slate-800">No hay solicitudes por el momento</h3>
            <p className="text-xs">Cuando los usuarios postulen para adoptar, aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solicitudes.map((sol) => {
              const mascota = sol.mascotas;
              const imgMascota = mascota?.imagen_url || mascota?.imagen || "/placeholder.png";

              return (
                <div
                  key={sol.id}
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header Tarjeta: Datos del Perro y Estado */}
                    <div className="flex items-center gap-3">
                      <img
                        src={imgMascota}
                        alt={mascota?.nombre || "Mascota"}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="font-extrabold text-sm text-slate-900 truncate">
                          Mascota: {mascota?.nombre || "N/A"}
                        </h2>
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                            sol.estado === "pendiente"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : sol.estado === "aprobada"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          ● {sol.estado}
                        </span>
                      </div>
                    </div>

                    {/* Resumen del Adoptante */}
                    <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-slate-800 truncate">
                        👤 {sol.nombres_apellidos || "Sin nombre registrado"}
                      </p>
                      <p className="text-slate-500">📞 {sol.telefono_contacto || "Sin teléfono"}</p>
                      <p className="text-slate-500">📍 {sol.ciudad || "N/A"} - {sol.direccion || "N/A"}</p>
                    </div>
                  </div>

                  {/* Botón Ver Detalle */}
                  <button
                    onClick={() => setSolicitudSeleccionada(sol)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Formulario Completo</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE LA SOLICITUD */}
      {solicitudSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto text-slate-800 space-y-6">
            
            {/* Cabecera del Modal */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-xl text-slate-900">
                  Evaluación de Solicitud de Adopción
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mascota: <strong>{solicitudSeleccionada.mascotas?.nombre}</strong>
                </p>
              </div>
              <button
                onClick={() => setSolicitudSeleccionada(null)}
                className="text-slate-400 hover:text-slate-800 font-bold text-sm bg-slate-100 px-3 py-1 rounded-full"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Cuestionario Completo */}
            <div className="space-y-4 text-xs">
              
              {/* Datos Personales */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-500" /> 1. Datos Personales
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p><strong>Nombres:</strong> {solicitudSeleccionada.nombres_apellidos}</p>
                  <p><strong>Cédula:</strong> {solicitudSeleccionada.cedula}</p>
                  <p><strong>Teléfono:</strong> {solicitudSeleccionada.telefono_contacto}</p>
                  <p><strong>Fecha Nacimiento:</strong> {solicitudSeleccionada.fecha_nacimiento}</p>
                  <p><strong>Ciudad:</strong> {solicitudSeleccionada.ciudad}</p>
                  <p><strong>Dirección:</strong> {solicitudSeleccionada.direccion}</p>
                </div>
              </div>

              {/* Vivienda */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Home className="w-4 h-4 text-amber-500" /> 2. Vivienda
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p><strong>Tipo:</strong> {solicitudSeleccionada.tipo_vivienda}</p>
                  <p><strong>Condición:</strong> {solicitudSeleccionada.condicion_vivienda}</p>
                  <p><strong>Tiene patio:</strong> {solicitudSeleccionada.tiene_patio ? "Sí" : "No"}</p>
                  <p><strong>Cerramiento seguro:</strong> {solicitudSeleccionada.vivienda_segura ? "Sí" : "No"}</p>
                </div>
              </div>

              {/* Composición Familiar y Experiencia */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" /> 3. Familia y Experiencia
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <p><strong>N° Personas en casa:</strong> {solicitudSeleccionada.cant_personas}</p>
                  <p><strong>¿Hay niños?:</strong> {solicitudSeleccionada.tiene_ninos ? `Sí (${solicitudSeleccionada.edades_ninos})` : "No"}</p>
                  <p><strong>Familia de acuerdo:</strong> {solicitudSeleccionada.familia_de_acuerdo ? "Sí" : "No"}</p>
                  <p><strong>Tuvo mascotas antes:</strong> {solicitudSeleccionada.tuvo_mascotas_antes ? "Sí" : "No"}</p>
                  <p><strong>Tiene mascotas actualmente:</strong> {solicitudSeleccionada.tiene_mascotas_actuales ? "Sí" : "No"}</p>
                </div>
                {solicitudSeleccionada.detalle_mascotas_actuales && (
                  <p className="mt-2 text-slate-600">
                    <strong>Detalle mascotas actuales:</strong> {solicitudSeleccionada.detalle_mascotas_actuales}
                  </p>
                )}
              </div>

              {/* Sobre la Adopción */}
              <div className="bg-slate-50 p-4 rounded-2xl space-y-2 border border-slate-100">
                <h4 className="font-bold text-slate-900 text-sm">4. Motivo y Cuidados</h4>
                <p className="text-slate-600"><strong>Motivo de adopción:</strong> {solicitudSeleccionada.motivo_adopcion}</p>
                <p className="text-slate-600"><strong>Responsable principal:</strong> {solicitudSeleccionada.responsable_principal}</p>
                <p className="text-slate-600"><strong>Horas sola al día:</strong> {solicitudSeleccionada.horas_sola}</p>
                <p className="text-slate-600"><strong>Plan en viajes/mudanza:</strong> {solicitudSeleccionada.plan_mudanza}</p>
              </div>

            </div>

            {/* Acciones del Refugio */}
            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                disabled={actualizando}
                onClick={() => cambiarEstado(solicitudSeleccionada.id, "aprobada")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Aprobar Adopción</span>
              </button>

              <button
                disabled={actualizando}
                onClick={() => cambiarEstado(solicitudSeleccionada.id, "rechazada")}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Rechazar Solicitud</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}