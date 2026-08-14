"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, XCircle, FileText, UserCheck, ShieldAlert } from "lucide-react";

interface Solicitud {
  id: string;
  mascota_id: string;
  tipo_vivienda: string;
  vivienda_propia: boolean;
  permite_mascotas: boolean;
  tiene_patio_cerrado: boolean;
  compromiso_esterilizacion: boolean;
  telefono_contacto: string;
  estado: "pendiente" | "aprobado" | "rechazado";
  mascotas?: { nombre: string; imagen: string };
}

export default function SolicitudesRefugioSection() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("solicitudes_adopcion")
      .select("*, mascotas(nombre, imagen)")
      .eq("refugio_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setSolicitudes(data);
  };

  const responderSolicitud = async (id: string, nuevoEstado: "aprobado" | "rechazado") => {
    const { error } = await supabase
      .from("solicitudes_adopcion")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (!error) {
      setSolicitudes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, estado: nuevoEstado } : s))
      );
    }
  };

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-lg font-black text-white flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#f4c430]" /> Solicitudes de Adopción Recibidas
      </h2>

      {solicitudes.length === 0 ? (
        <div className="p-8 bg-stone-900 rounded-2xl border border-stone-800 text-center text-stone-400 text-xs">
          No hay solicitudes pendientes de evaluación en este momento.
        </div>
      ) : (
        <div className="grid gap-4">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <img src={solicitud.mascotas?.imagen} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Postulación para {solicitud.mascotas?.nombre}</h3>
                    <p className="text-xs text-stone-400">Contacto: {solicitud.telefono_contacto}</p>
                  </div>
                </div>
                <span className={`text-[10px] uppercase font-bold px-3 py-1 rounded-full border ${
                  solicitud.estado === "aprobado" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                  solicitud.estado === "rechazado" ? "bg-red-500/20 text-red-400 border-red-500/30" :
                  "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}>
                  {solicitud.estado}
                </span>
              </div>

              {/* LISTA DE EVALUACIÓN DE CONDICIONES */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-stone-950 p-4 rounded-xl text-xs">
                <div>
                  <span className="block text-stone-500 text-[10px]">Vivienda</span>
                  <strong className="text-white">{solicitud.tipo_vivienda} ({solicitud.vivienda_propia ? "Propia" : "Arrendada"})</strong>
                </div>
                <div>
                  <span className="block text-stone-500 text-[10px]">Permiten Mascotas</span>
                  <strong className={solicitud.permite_mascotas ? "text-emerald-400" : "text-red-400"}>
                    {solicitud.permite_mascotas ? "Sí Permite" : "No Permite"}
                  </strong>
                </div>
                <div>
                  <span className="block text-stone-500 text-[10px]">Patio Cerrado</span>
                  <strong className={solicitud.tiene_patio_cerrado ? "text-emerald-400" : "text-amber-400"}>
                    {solicitud.tiene_patio_cerrado ? "Sí Posee" : "No Posee"}
                  </strong>
                </div>
                <div>
                  <span className="block text-stone-500 text-[10px]">Compromiso Esterilización</span>
                  <strong className="text-emerald-400">Aceptado</strong>
                </div>
              </div>

              {/* ACCIONES DE APROBACIÓN */}
              {solicitud.estado === "pendiente" && (
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => responderSolicitud(solicitud.id, "rechazado")}
                    className="flex items-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-4 py-2 rounded-xl transition font-semibold"
                  >
                    <XCircle className="w-4 h-4" /> Rechazar Entrega
                  </button>
                  <button
                    onClick={() => responderSolicitud(solicitud.id, "aprobado")}
                    className="flex items-center gap-1 bg-[#f4c430] hover:bg-[#e0b020] text-stone-950 text-xs px-4 py-2 rounded-xl font-bold transition"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprobar y Entregar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}