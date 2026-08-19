"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Home,
  HeartHandshake,
  Users,
  ClipboardCheck,
} from "lucide-react";

const supabase = createClient();

export default function RefugioSolicitudesPage() {

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<any>(null);

  const [actualizando, setActualizando] =
    useState(false);

  // ==========================================================
  // CARGAR SOLICITUDES
  // ==========================================================

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {

    setCargando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from("solicitudes_adopcion")
      .select(`
        *,
        mascotas (
          id,
          nombre,
          imagen_url,
          imagen,
          especie,
          raza,
          edad,
          estado_adopcion
        )
      `)
      .eq("refugio_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error cargando solicitudes:",
        error
      );
    } else {
      setSolicitudes(data || []);
    }

    setCargando(false);
  };

  // ==========================================================
  // CAMBIAR ESTADO
  // ==========================================================

  const cambiarEstado = async (
    solicitud: any,
    nuevoEstado:
      | "aprobada"
      | "rechazada"
  ) => {

    setActualizando(true);

    // --------------------------------------------------------
    // ACTUALIZAR SOLICITUD
    // --------------------------------------------------------

    const { error: solicitudError } =
      await supabase
        .from("solicitudes_adopcion")
        .update({
          estado: nuevoEstado,
        })
        .eq("id", solicitud.id);

    if (solicitudError) {

      alert(
        "Error actualizando solicitud: " +
          solicitudError.message
      );

      setActualizando(false);
      return;
    }

    // --------------------------------------------------------
    // SI SE APRUEBA
    // LA MASCOTA PASA A ADOPTADA
    // --------------------------------------------------------

    if (
      nuevoEstado === "aprobada" &&
      solicitud.mascota_id
    ) {

      const { error: mascotaError } =
        await supabase
          .from("mascotas")
          .update({
            estado_adopcion: "Adoptada",
          })
          .eq(
            "id",
            solicitud.mascota_id
          );

      if (mascotaError) {

        alert(
          "La solicitud fue aprobada, pero ocurrió un error actualizando la mascota: " +
            mascotaError.message
        );

        setActualizando(false);
        return;
      }
    }

    // --------------------------------------------------------
    // SI SE RECHAZA
    // LA MASCOTA SIGUE DISPONIBLE
    // --------------------------------------------------------

    if (
      nuevoEstado === "rechazada" &&
      solicitud.mascota_id
    ) {

      const { error: mascotaError } =
        await supabase
          .from("mascotas")
          .update({
            estado_adopcion: "Disponible",
          })
          .eq(
            "id",
            solicitud.mascota_id
          );

      if (mascotaError) {

        console.error(
          "Error actualizando mascota:",
          mascotaError
        );
      }
    }

    setActualizando(false);

    alert(
      nuevoEstado === "aprobada"
        ? "¡Adopción aprobada correctamente!"
        : "Solicitud rechazada correctamente."
    );

    setSolicitudSeleccionada(null);

    cargarSolicitudes();
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (cargando) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center gap-2 text-slate-500">

        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />

        <span className="text-sm">
          Cargando solicitudes...
        </span>

      </div>
    );
  }

  // ==========================================================
  // INTERFAZ
  // ==========================================================

  return (

    <main className="min-h-screen bg-slate-50 p-6 md:p-10 text-slate-800">

      <div className="max-w-6xl mx-auto space-y-6">

        <div>

          <h1 className="text-2xl font-black text-slate-900">
            Solicitudes de Adopción
          </h1>

          <p className="text-xs text-slate-500">
            Revisa las postulaciones recibidas
            para las mascotas de tu refugio.
          </p>

        </div>

        {solicitudes.length === 0 ? (

          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">

            <HeartHandshake className="w-12 h-12 text-amber-400 mx-auto" />

            <h3 className="font-bold text-slate-800 mt-3">
              No hay solicitudes
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Cuando un adoptante postule,
              aparecerá aquí.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

            {solicitudes.map((sol) => {

              const mascota =
                sol.mascotas;

              const imagen =
                mascota?.imagen_url ||
                mascota?.imagen ||
                "/placeholder.png";

              return (

                <div
                  key={sol.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
                >

                  <div className="flex items-center gap-3">

                    <img
                      src={imagen}
                      alt={mascota?.nombre}
                      className="w-14 h-14 rounded-xl object-cover"
                    />

                    <div className="flex-1">

                      <h2 className="font-black text-sm">
                        {mascota?.nombre ||
                          "Mascota"}
                      </h2>

                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                          sol.estado ===
                          "aprobada"
                            ? "bg-emerald-100 text-emerald-700"
                            : sol.estado ===
                              "rechazada"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {sol.estado}
                      </span>

                    </div>

                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mt-4 text-xs">

                    <p className="font-bold">
                      👤{" "}
                      {sol.nombres_apellidos ||
                        "Sin nombre"}
                    </p>

                    <p className="text-slate-500 mt-1">
                      📞{" "}
                      {sol.telefono_contacto ||
                        "Sin teléfono"}
                    </p>

                    <p className="text-slate-500 mt-1">
                      📍{" "}
                      {sol.ciudad ||
                        "Sin ciudad"}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setSolicitudSeleccionada(
                        sol
                      )
                    }
                    className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >

                    <Eye className="w-4 h-4" />

                    Ver solicitud completa

                  </button>

                </div>

              );
            })}

          </div>

        )}

      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {solicitudSeleccionada && (

        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-800">

            <div className="flex justify-between items-start border-b pb-4">

              <div>

                <h2 className="text-xl font-black">
                  Evaluación de Adopción
                </h2>

                <p className="text-xs text-slate-500">
                  Mascota:{" "}
                  <strong>
                    {
                      solicitudSeleccionada
                        .mascotas?.nombre
                    }
                  </strong>
                </p>

              </div>

              <button
                onClick={() =>
                  setSolicitudSeleccionada(
                    null
                  )
                }
                className="bg-slate-100 px-3 py-1 rounded-full text-xs font-bold"
              >
                ✕ Cerrar
              </button>

            </div>

            <div className="space-y-4 mt-5 text-xs">

              {/* DATOS PERSONALES */}

              <div className="bg-slate-50 p-4 rounded-2xl">

                <h3 className="font-bold text-sm flex items-center gap-2">

                  <User className="w-4 h-4 text-amber-500" />

                  1. Datos personales

                </h3>

                <div className="grid md:grid-cols-2 gap-2 mt-3">

                  <p>
                    <strong>Nombres:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .nombres_apellidos
                    }
                  </p>

                  <p>
                    <strong>Cédula:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .cedula
                    }
                  </p>

                  <p>
                    <strong>Teléfono:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .telefono_contacto
                    }
                  </p>

                  <p>
                    <strong>Fecha nacimiento:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .fecha_nacimiento
                    }
                  </p>

                  <p>
                    <strong>Ciudad:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .ciudad
                    }
                  </p>

                  <p>
                    <strong>Dirección:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .direccion
                    }
                  </p>

                </div>

              </div>

              {/* VIVIENDA */}

              <div className="bg-slate-50 p-4 rounded-2xl">

                <h3 className="font-bold text-sm flex items-center gap-2">

                  <Home className="w-4 h-4 text-amber-500" />

                  2. Vivienda

                </h3>

                <div className="grid md:grid-cols-2 gap-2 mt-3">

                  <p>
                    <strong>Tipo:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .tipo_vivienda
                    }
                  </p>

                  <p>
                    <strong>Condición:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .condicion_vivienda
                    }
                  </p>

                  <p>
                    <strong>Tiene patio:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .tiene_patio
                        ? "Sí"
                        : "No"
                    }
                  </p>

                  <p>
                    <strong>Vivienda segura:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .vivienda_segura
                        ? "Sí"
                        : "No"
                    }
                  </p>

                </div>

              </div>

              {/* FAMILIA */}

              <div className="bg-slate-50 p-4 rounded-2xl">

                <h3 className="font-bold text-sm flex items-center gap-2">

                  <Users className="w-4 h-4 text-amber-500" />

                  3. Familia y experiencia

                </h3>

                <div className="space-y-2 mt-3">

                  <p>
                    <strong>Personas en casa:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .cant_personas
                    }
                  </p>

                  <p>
                    <strong>Niños:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .tiene_ninos
                        ? `Sí (${solicitudSeleccionada.edades_ninos})`
                        : "No"
                    }
                  </p>

                  <p>
                    <strong>Familia de acuerdo:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .familia_de_acuerdo
                        ? "Sí"
                        : "No"
                    }
                  </p>

                  <p>
                    <strong>Tuvo mascotas:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .tuvo_mascotas_antes
                        ? "Sí"
                        : "No"
                    }
                  </p>

                  <p>
                    <strong>Mascotas actuales:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .tiene_mascotas_actuales
                        ? "Sí"
                        : "No"
                    }
                  </p>

                  {solicitudSeleccionada
                    .detalle_mascotas_actuales && (

                    <p>
                      <strong>
                        Detalle:
                      </strong>{" "}
                      {
                        solicitudSeleccionada
                          .detalle_mascotas_actuales
                      }
                    </p>

                  )}

                </div>

              </div>

              {/* ADOPCIÓN */}

              <div className="bg-slate-50 p-4 rounded-2xl">

                <h3 className="font-bold text-sm flex items-center gap-2">

                  <ClipboardCheck className="w-4 h-4 text-amber-500" />

                  4. Plan de adopción

                </h3>

                <div className="space-y-2 mt-3">

                  <p>
                    <strong>Motivo:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .motivo_adopcion
                    }
                  </p>

                  <p>
                    <strong>Responsable:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .responsable_principal
                    }
                  </p>

                  <p>
                    <strong>Horas sola:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .horas_sola
                    }
                  </p>

                  <p>
                    <strong>Plan de mudanza/viaje:</strong>{" "}
                    {
                      solicitudSeleccionada
                        .plan_mudanza
                    }
                  </p>

                </div>

              </div>

            </div>

            {/* ACCIONES */}

            {solicitudSeleccionada.estado ===
              "pendiente" && (

              <div className="flex gap-3 mt-6 pt-5 border-t">

                <button
                  disabled={actualizando}
                  onClick={() =>
                    cambiarEstado(
                      solicitudSeleccionada,
                      "rechazada"
                    )
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >

                  <XCircle className="w-4 h-4" />

                  Rechazar

                </button>

                <button
                  disabled={actualizando}
                  onClick={() =>
                    cambiarEstado(
                      solicitudSeleccionada,
                      "aprobada"
                    )
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >

                  <CheckCircle className="w-4 h-4" />

                  Aprobar adopción

                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}