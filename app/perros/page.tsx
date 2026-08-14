
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Heart, X, CheckCircle2 } from "lucide-react";

interface Mascota {
  id: string;
  nombre: string;
  raza: string;
  edad: string;
  tamanio: string;
  descripcion: string;
  imagen: string;
  user_id: string; // ID del refugio
}

export default function PerrosPage() {
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [loading, setLoading] = useState(true);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState<Mascota | null>(null);

  // Estados del Formulario de Adopción
  const [tipoVivienda, setTipoVivienda] = useState("Casa");
  const [viviendaPropia, setViviendaPropia] = useState(false);
  const [permiteMascotas, setPermiteMascotas] = useState(true);
  const [tienePatioCerrado, setTienePatioCerrado] = useState(false);
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);

  useEffect(() => {
    async function obtenerMascotas() {
      const { data } = await supabase
        .from("mascotas")
        .select("*")
        .eq("estado", "aprobado"); // Solo mostrar aprobados por el admin

      if (data) setMascotas(data);
      setLoading(false);
    }
    obtenerMascotas();
  }, []);

  // Función para enviar la solicitud a la base de datos
  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mascotaSeleccionada) return;

    setEnviando(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("Debes iniciar sesión para postular a una adopción.");
      setEnviando(false);
      return;
    }

    const { error } = await supabase.from("solicitudes_adopcion").insert([
      {
        mascota_id: mascotaSeleccionada.id,
        refugio_id: mascotaSeleccionada.user_id,
        adoptante_id: user.id,
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
      alert("Hubo un error al enviar tu solicitud: " + error.message);
    } else {
      setMensajeExito(true);
      setTimeout(() => {
        setMensajeExito(false);
        setMascotaSeleccionada(null);
      }, 2500);
    }
  };

  return (
    <main className="min-h-screen bg-stone-100 p-6 md:p-12 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-stone-800">Mascotas en Adopción</h1>

        {loading ? (
          <p className="text-stone-500 animate-pulse">Cargando peluditos...</p>
        ) : mascotas.length === 0 ? (
          <p className="text-stone-500">No hay perritos disponibles en este momento.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mascotas.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-200 flex flex-col justify-between"
              >
                <img src={m.imagen} alt={m.nombre} className="h-56 w-full object-cover" />
                <div className="p-5 space-y-2">
                  <h2 className="text-2xl font-black text-stone-800">{m.nombre}</h2>
                  <p className="text-xs text-stone-500">{m.raza} • {m.edad} • {m.tamanio}</p>
                  <p className="text-sm text-stone-600 line-clamp-2">{m.descripcion}</p>
                  
                  <button
                    onClick={() => setMascotaSeleccionada(m)}
                    className="w-full mt-4 bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-stone-900" /> Solicitar Adopción
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CON EL FORMULARIO DE CONDICIONES */}
      {mascotaSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full relative shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-stone-800">
            
            <button
              onClick={() => setMascotaSeleccionada(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            {mensajeExito ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-stone-900">¡Solicitud Enviada!</h3>
                <p className="text-xs text-stone-500">
                  El refugio evaluará tus respuestas y se pondrá en contacto contigo.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="font-black text-lg text-stone-900">
                    Postular para adoptar a {mascotaSeleccionada.nombre}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Por favor responde el cuestionario de requisitos del refugio.
                  </p>
                </div>

                <form onSubmit={enviarSolicitud} className="space-y-4 text-stone-800">
                  <div>
                    <label className="text-xs font-semibold block mb-1">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={telefonoContacto}
                      onChange={(e) => setTelefonoContacto(e.target.value)}
                      className="w-full border border-stone-300 p-2 rounded-xl text-xs focus:outline-none focus:border-[#f4c430]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1">Tipo de vivienda</label>
                    <select
                      value={tipoVivienda}
                      onChange={(e) => setTipoVivienda(e.target.value)}
                      className="w-full border border-stone-300 p-2 rounded-xl text-xs focus:outline-none focus:border-[#f4c430]"
                    >
                      <option value="Casa">Casa</option>
                      <option value="Departamento">Departamento</option>
                    </select>
                  </div>

                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={viviendaPropia}
                        onChange={(e) => setViviendaPropia(e.target.checked)}
                      />
                      <span>¿La vivienda es propia?</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permiteMascotas}
                        onChange={(e) => setPermiteMascotas(e.target.checked)}
                      />
                      <span>En caso de arriendo, ¿cuentas con permiso para mascotas?</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tienePatioCerrado}
                        onChange={(e) => setTienePatioCerrado(e.target.checked)}
                      />
                      <span>¿Cuenta con cerramiento o patio seguro?</span>
                    </label>

                    <label className="flex items-center gap-2 font-bold text-amber-700 pt-1 cursor-pointer">
                      <input type="checkbox" required defaultChecked />
                      <span>Acepto el compromiso de esterilización y seguimiento.</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={enviando}
                    className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {enviando ? "Enviando..." : "Enviar Solicitud a Evaluación"}
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