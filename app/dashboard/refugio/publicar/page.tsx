"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  ArrowLeft,
  Dog,
  Activity,
  Smile,
  BookOpen,
  FileText,
  Camera,
  Loader2,
  CheckCircle2,
} from "lucide-react";

// Instancia única cliente fuera del ciclo de renderizado
const supabase = createClient();

const INITIAL_STATE = {
  nombre: "",
  especie: "Perro",
  raza: "",
  sexo: "Macho",
  edad: "",
  tamano: "Mediano",
  peso: "",
  vacunada: false,
  desparasitada: false,
  esterilizada: false,
  salud: "",
  fechaRevision: "",
  nivelEnergia: "Medio",
  amigablePersonas: true,
  conviveNinos: true,
  conviveMascotas: true,
  temperamento: "",
  lugarRescate: "",
  fechaIngreso: "",
  motivoRescate: "",
  observaciones: "",
  descripcion: "",
  requisitosEspeciales: "",
  estadoAdopcion: "Disponible",
  fotoPrincipal: "",
};

export default function NuevaMascotaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setErrorSubmit(null);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setErrorSubmit("Debes estar autenticado como refugio para publicar.");
      setGuardando(false);
      return;
    }

    const { error } = await supabase.from("mascotas").insert([
      {
        refugio_id: user.id,
        id_refugio: user.id,
        user_id: user.id,
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza || "Mestizo",
        sexo: formData.sexo,
        edad: formData.edad,
        tamano: formData.tamano,
        peso: formData.peso,
        vacunada: formData.vacunada,
        desparasitada: formData.desparasitada,
        esterilizada: formData.esterilizada,
        salud: formData.salud,
        fecha_revision: formData.fechaRevision || null,
        nivel_energia: formData.nivelEnergia,
        amigable_personas: formData.amigablePersonas,
        convive_ninos: formData.conviveNinos,
        convive_mascotas: formData.conviveMascotas,
        temperamento: formData.temperamento,
        lugar_rescate: formData.lugarRescate,
        fecha_ingreso: formData.fechaIngreso || null,
        motivo_rescate: formData.motivoRescate,
        observaciones: formData.observaciones,
        descripcion: formData.descripcion,
        requisitos_especiales: formData.requisitosEspeciales,
        estado_adopcion: formData.estadoAdopcion,
        estado: "pendiente",
        fecha_publicacion: new Date().toISOString(),
        foto_principal: formData.fotoPrincipal,
        imagen_url: formData.fotoPrincipal,
        imagen: formData.fotoPrincipal,
      },
    ]);

    setGuardando(false);

    if (error) {
      setErrorSubmit("Error al registrar mascota: " + error.message);
    } else {
      setMensajeExito(true);
      setTimeout(() => {
        router.push("/dashboard/refugio");
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/dashboard/refugio"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-amber-400 transition text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>

        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Dog className="w-7 h-7 text-[#FFB800]" />
            Formulario de Registro de Mascota
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Registra toda la información necesaria antes de publicar la mascota en Patitas al Hogar.
          </p>
        </div>

        {errorSubmit && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-xs">
            {errorSubmit}
          </div>
        )}

        {mensajeExito ? (
          <div className="bg-neutral-900 border border-emerald-500/30 p-12 rounded-3xl text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-white">¡Mascota Registrada con Éxito!</h2>
            <p className="text-xs text-neutral-400">Redirigiendo a tu panel de refugio...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <Dog className="w-4 h-4" /> 1. Información General
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Nombre de la mascota *</label>
                  <input
                    type="text"
                    name="nombre"
                    required
                    placeholder="Ej. Luna"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Especie *</label>
                  <select
                    name="especie"
                    value={formData.especie}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Raza</label>
                  <input
                    type="text"
                    name="raza"
                    placeholder="Ej. Mestizo"
                    value={formData.raza}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Sexo *</label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Fecha de Nacimiento / Edad *</label>
                  <input
                    type="text"
                    name="edad"
                    required
                    placeholder="Ej. 2 años"
                    value={formData.edad}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Tamaño *</label>
                  <select
                    name="tamano"
                    value={formData.tamano}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  >
                    <option value="Pequeño">Pequeño</option>
                    <option value="Mediano">Mediano</option>
                    <option value="Grande">Grande</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-1 font-medium">Peso (Opcional)</label>
                  <input
                    type="text"
                    name="peso"
                    placeholder="Ej. 12 kg"
                    value={formData.peso}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: ESTADO DE SALUD */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <Activity className="w-4 h-4" /> 2. Estado de Salud
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 bg-neutral-800 p-3 rounded-xl border border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="vacunada"
                    checked={formData.vacunada}
                    onChange={handleChange}
                    className="accent-[#FFB800]"
                  />
                  <span>¿Está vacunada?</span>
                </label>

                <label className="flex items-center gap-2 bg-neutral-800 p-3 rounded-xl border border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="desparasitada"
                    checked={formData.desparasitada}
                    onChange={handleChange}
                    className="accent-[#FFB800]"
                  />
                  <span>¿Está desparasitada?</span>
                </label>

                <label className="flex items-center gap-2 bg-neutral-800 p-3 rounded-xl border border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="esterilizada"
                    checked={formData.esterilizada}
                    onChange={handleChange}
                    className="accent-[#FFB800]"
                  />
                  <span>¿Está esterilizada/castrada?</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Enfermedades o condiciones médicas</label>
                  <input
                    type="text"
                    name="salud"
                    placeholder="Ej. Ninguna / Requiere alimento especial"
                    value={formData.salud}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Última revisión veterinaria</label>
                  <input
                    type="date"
                    name="fechaRevision"
                    value={formData.fechaRevision}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: COMPORTAMIENTO */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <Smile className="w-4 h-4" /> 3. Comportamiento
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Nivel de Energía</label>
                  <select
                    name="nivelEnergia"
                    value={formData.nivelEnergia}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  >
                    <option value="Bajo">Bajo</option>
                    <option value="Medio">Medio</option>
                    <option value="Alto">Alto</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Descripción del temperamento</label>
                  <input
                    type="text"
                    name="temperamento"
                    placeholder="Ej. Muy cariñosa, juguetona y dócil"
                    value={formData.temperamento}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 bg-neutral-800 p-3 rounded-xl border border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="amigablePersonas"
                    checked={formData.amigablePersonas}
                    onChange={handleChange}
                    className="accent-[#FFB800]"
                  />
                  <span>¿Amigable con personas?</span>
                </label>

                <label className="flex items-center gap-2 bg-neutral-800 p-3 rounded-xl border border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="conviveNinos"
                    checked={formData.conviveNinos}
                    onChange={handleChange}
                    className="accent-[#FFB800]"
                  />
                  <span>¿Convive con niños?</span>
                </label>

                <label className="flex items-center gap-2 bg-neutral-800 p-3 rounded-xl border border-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    name="conviveMascotas"
                    checked={formData.conviveMascotas}
                    onChange={handleChange}
                    className="accent-[#FFB800]"
                  />
                  <span>¿Convive con otras mascotas?</span>
                </label>
              </div>
            </div>

            {/* SECCIÓN 4: HISTORIA */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> 4. Historia de la Mascota
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Lugar de Rescate</label>
                  <input
                    type="text"
                    name="lugarRescate"
                    placeholder="Ej. Sector La Carolina"
                    value={formData.lugarRescate}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Fecha de ingreso al refugio</label>
                  <input
                    type="date"
                    name="fechaIngreso"
                    value={formData.fechaIngreso}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Motivo de rescate o abandono</label>
                  <input
                    type="text"
                    name="motivoRescate"
                    placeholder="Ej. Rescatada de la calle"
                    value={formData.motivoRescate}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Observaciones importantes</label>
                  <input
                    type="text"
                    name="observaciones"
                    placeholder="Ej. Asustadiza con ruidos fuertes"
                    value={formData.observaciones}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 5: PUBLICACIÓN */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <FileText className="w-4 h-4" /> 5. Publicación
              </h2>

              <div>
                <label className="block mb-1 font-medium">Descripción para adopción *</label>
                <textarea
                  name="descripcion"
                  rows={3}
                  required
                  placeholder="Ej. Luna fue rescatada de la calle y busca una familia responsable..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Requisitos especiales</label>
                  <input
                    type="text"
                    name="requisitosEspeciales"
                    placeholder="Ej. Casa con patio cerrado"
                    value={formData.requisitosEspeciales}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Estado de adopción</label>
                  <select
                    name="estadoAdopcion"
                    value={formData.estadoAdopcion}
                    onChange={handleChange}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  >
                    <option value="Disponible">Disponible</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Adoptada">Adoptada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 6: FOTOGRAFÍAS */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <Camera className="w-4 h-4" /> 6. Fotografías
              </h2>

              <div>
                <label className="block mb-1 font-medium">URL de la Foto Principal *</label>
                <input
                  type="url"
                  name="fotoPrincipal"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.fotoPrincipal}
                  onChange={handleChange}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>

              {formData.fotoPrincipal && (
                <div className="mt-2">
                  <span className="block text-[10px] text-neutral-400 mb-1">Vista previa:</span>
                  <img
                    src={formData.fotoPrincipal}
                    alt="Vista previa"
                    className="w-32 h-32 object-cover rounded-xl border border-neutral-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.png";
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-[#FFB800] hover:bg-[#e6a600] text-neutral-950 font-black py-4 rounded-2xl text-sm transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Guardando registro...
                </>
              ) : (
                "Guardar y Publicar Mascota"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}