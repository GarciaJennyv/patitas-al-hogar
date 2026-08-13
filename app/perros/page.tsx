
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";

export default function PerrosPage() {
  // Lista de ejemplo temporal (luego se reemplaza con Supabase / API)
  const perritos = [
    { id: 1, nombre: "Max", raza: "Golden Retriever", edad: "2 años", imagen: "/amigo.jpg" },
    { id: 2, nombre: "Luna", raza: "Pastor Alemán", edad: "1 año", imagen: "/amigo.jpg" },
    { id: 3, nombre: "Rocky", raza: "Labrador", edad: "3 años", imagen: "/amigo.jpg" },
  ];

  return (
    <main className="min-h-screen bg-stone-900 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Navegación de retorno */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[#f4c430] hover:underline mb-8 font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al inicio
        </Link>

        {/* Encabezado */}
        <div className="mb-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Mascotas en adopción</h1>
            <p className="text-stone-400 text-sm md:text-base mt-1">
              Conoce a nuestros perritos que buscan un hogar lleno de amor.
            </p>
          </div>
          <Link
            href="/dashboard/razas"
            className="text-xs bg-stone-800 hover:bg-stone-700 text-[#f4c430] border border-stone-700 font-semibold px-4 py-2 rounded-xl transition"
          >
            Ver guía de razas 🐶
          </Link>
        </div>

        {/* Cuadrícula de tarjetas de perritos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {perritos.map((perro) => (
            <div 
              key={perro.id} 
              className="bg-stone-800 rounded-2xl border border-stone-700 overflow-hidden shadow-lg flex flex-col justify-between hover:border-[#f4c430] transition group"
            >
              <div>
                <div className="h-52 w-full relative bg-stone-900 overflow-hidden">
                  <img 
                    src={perro.imagen} 
                    alt={perro.nombre} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md p-2 rounded-full border border-stone-700 text-red-400">
                    <Heart className="w-4 h-4 fill-red-400/20" />
                  </div>
                </div>
                
                <div className="p-5">
                  <h2 className="text-xl font-bold text-white">{perro.nombre}</h2>
                  <p className="text-sm text-stone-400 mt-1">{perro.raza} • {perro.edad}</p>
                </div>
              </div>

              <div className="p-5 pt-0">
                {/* Ruta dinámica de detalle */}
                <Link
                  href={`/perros/${perro.id}`}
                  className="block text-center w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold py-2.5 rounded-xl transition shadow-md"
                >
                  Ver Detalle
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}