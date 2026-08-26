"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
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
  Building2,
} from "lucide-react";

const supabase = createClient();

interface RefugioOption {
  id: string;
  nombre: string;
}

const INITIAL_STATE = {
  refugioId: "", // ID del refugio seleccionado por el admin
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

export default function PublicarMascotaAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [refugios, setRefugios] = useState<RefugioOption[]>([]);
  const [cargandoRefugios, setCargandoRefugios] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  // Cargar lista de refugios registrados para el selector del admin
  useEffect(() => {
    async function fetchRefugios() {
      const { data, error } = await supabase
        .from("refugios")
        .select("id, nombre");

      if (!error && data) {
        setRefugios(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, refugioId: data[0].id }));
        }
      }
      setCargandoRefugios(false);
    }
    fetchRefugios();
  }, []);

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

    const targetRefugioId = formData.refugioId;

    const { error } = await supabase.from("mascotas").insert([
      {
        refugio_id: targetRefugioId,
        id_refugio: targetRefugioId,
        user_id: targetRefugioId,
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
        estado: "aprobado", // Al ser publicado por el admin se aprueba automáticamente
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
        router.push("/admin/mascotas");
      }, 2000);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/admin/mascotas"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-amber-400 transition text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Gestión de Mascotas
        </Link>

        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Dog className="w-7 h-7 text-[#FFB800]" />
            Publicar Mascota (Panel de Administración)
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Registra y aprueba directamente una nueva mascota dentro de Patitas al Hogar.
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
            <h2 className="text-xl font-bold text-white">¡Mascota Publicada con Éxito!</h2>
            <p className="text-xs text-neutral-400">Redirigiendo al panel de administración...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* SECCIÓN 0: ASIGNACIÓN DE REFUGIO */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Asignación de Refugio
              </h2>
              <div>
                <label className="block mb-1 font-medium">Refugio Responsable *</label>
                {cargandoRefugios ? (
                  <p className="text-neutral-500">Cargando refugios...</p>
                ) : (
                  <select
                    name="refugioId"
                    value={formData.refugioId}
                    onChange={handleChange}
                    required
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                  >
                    {refugios.map((refugio) => (
                      <option key={refugio.id} value={refugio.id}>
                        {refugio.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

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
                  <label className="block mb-1 font-medium font-medium">Raza</label>
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
                    <option value="Hembra font-medium">Hembra</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium font-medium">Edad *</label>
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
              </div>
            </div>

            {/* SECCIÓN 2: PUBLICACIÓN */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <FileText className="w-4 h-4" /> 2. Publicación
              </h2>

              <div>
                <label className="block mb-1 font-medium">Descripción *</label>
                <textarea
                  name="descripcion"
                  rows={3}
                  required
                  placeholder="Ej. Rescatada de la calle, lista para ser adoptada..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>
            </div>

            {/* SECCIÓN 3: FOTOGRAFÍAS */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <h2 className="text-sm font-bold text-[#FFB800] flex items-center gap-2">
                <Camera className="w-4 h-4" /> 3. Fotografía
              </h2>

              <div>
                <label className="block mb-1 font-medium">URL de Foto Principal *</label>
                <input
                  type="url"
                  name="fotoPrincipal"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.fotoPrincipal}
                  onChange={handleChange}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#FFB800]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-[#FFB800] hover:bg-[#e6a600] text-neutral-950 font-black py-4 rounded-2xl text-sm transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publicando como Administrador...
                </>
              ) : (
                "Guardar y Publicar Directamente"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}