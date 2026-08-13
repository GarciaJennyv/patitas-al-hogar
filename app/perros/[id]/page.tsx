import Link from "next/link";
import { ArrowLeft, Heart, ShieldCheck, MapPin, Calendar, Dog } from "lucide-react";

// Datos de prueba simulando la consulta a una base de datos o API
const perritos = [
  {
    id: 1,
    nombre: "Max",
    raza: "Golden Retriever",
    edad: "2 años",
    sexo: "Macho",
    ubicacion: "Quito, Norte",
    vacunado: true,
    esterilizado: true,
    descripcion: "Max es un perrito muy juguetón, cariñoso y amigable con niños y otras mascotas. Le encanta salir a correr por las mañanas y aprender nuevos trucos.",
    imagen: "/amigo.jpg",
  },
  {
    id: 2,
    nombre: "Luna",
    raza: "Pastor Alemán",
    edad: "1 año",
    sexo: "Hembra",
    ubicacion: "Quito, Valle de los Chillos",
    vacunado: true,
    esterilizado: true,
    descripcion: "Luna es muy obediente, protectora y leal. Se adapta rápido a nuevos entornos y le gusta acompañar a su familia en paseos al aire libre.",
    imagen: "/amigo.jpg",
  },
  {
    id: 3,
    nombre: "Rocky",
    raza: "Labrador",
    edad: "3 años",
    sexo: "Macho",
    ubicacion: "Quito, Sur",
    vacunado: true,
    esterilizado: false,
    descripcion: "Rocky es tranquilo, noble y muy paciente. Es el compañero perfecto para la vida en departamento o casa con jardín.",
    imagen: "/amigo.jpg",
  },
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PerroDetallePage({ params }: Props) {
  // En Next.js 15, params es una promesa que debemos resolver
  const resolvedParams = await params;
  const perroId = Number(resolvedParams.id);

  // Buscamos la mascota seleccionada por id
  const perro = perritos.find((p) => p.id === perroId);

  if (!perro) {
    return (
      <main className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <Dog className="w-16 h-16 text-[#f4c430] mb-4 opacity-80" />
        <h1 className="text-2xl font-bold mb-2">Mascota no encontrada</h1>
        <p className="text-stone-400 text-sm mb-6">El perrito que buscas no existe o ya ha sido adoptado.</p>
        <Link
          href="/perros"
          className="bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold px-6 py-2.5 rounded-xl transition"
        >
          Volver al catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-900 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Botón Volver */}
        <Link
          href="/perros"
          className="inline-flex items-center gap-2 text-[#f4c430] hover:underline mb-6 font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al catálogo
        </Link>

        {/* Tarjeta Principal de Detalle */}
        <div className="bg-stone-800 border border-stone-700 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-2">
          
          {/* Imagen de la mascota */}
          <div className="relative h-72 md:h-full bg-stone-900 min-h-[300px]">
            <img
              src={perro.imagen}
              alt={perro.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-stone-900/80 backdrop-blur-md p-2.5 rounded-full border border-stone-700 text-red-400">
              <Heart className="w-5 h-5 fill-red-400/20" />
            </div>
          </div>

          {/* Información detallada */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-black text-white">{perro.nombre}</h1>
                <span className="bg-[#f4c430]/20 text-[#f4c430] text-xs font-bold px-3 py-1 rounded-full border border-[#f4c430]/30">
                  {perro.sexo}
                </span>
              </div>

              <p className="text-stone-400 text-sm mb-4">{perro.raza}</p>

              {/* Insignias de detalles rápido */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-700 flex items-center gap-2.5 text-xs text-stone-300">
                  <Calendar className="w-4 h-4 text-[#f4c430]" />
                  <span><strong>Edad:</strong> {perro.edad}</span>
                </div>
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-700 flex items-center gap-2.5 text-xs text-stone-300">
                  <MapPin className="w-4 h-4 text-[#f4c430]" />
                  <span className="truncate">{perro.ubicacion}</span>
                </div>
              </div>

              {/* Estado de Salud */}
              <div className="space-y-2 mb-6">
                <h3 className="text-xs uppercase tracking-wider text-stone-400 font-bold">Estado de Salud</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  {perro.vacunado && (
                    <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Vacunas al día
                    </span>
                  )}
                  {perro.esterilizado && (
                    <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Esterilizado/a
                    </span>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-2">Sobre {perro.nombre}</h3>
                <p className="text-stone-300 text-sm leading-relaxed">
                  {perro.descripcion}
                </p>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-4 border-t border-stone-700">
              <button
                type="button"
                className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-extrabold py-3.5 rounded-2xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🐾</span>
                <span>Solicitar Adopción</span>
              </button>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
