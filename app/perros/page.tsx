import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function PerrosPage() {
  // Lista de ejemplo temporal (aquí luego puedes conectar tu API o Supabase)
  const perritos = [
    { id: 1, nombre: "Max", raza: "Golden Retriever", edad: "2 años", imagen: "/amigo.jpg" },
    { id: 2, nombre: "Luna", raza: "Pastor Alemán", edad: "1 año", imagen: "/amigo.jpg" },
    { id: 3, nombre: "Rocky", raza: "Labrador", edad: "3 años", imagen: "/amigo.jpg" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Barra de navegación superior reutilizable */}
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Mascotas en adopción</h1>
          <p className="text-gray-600 mt-1">Conoce a nuestros perritos que buscan un hogar lleno de amor.</p>
        </div>

        {/* Cuadrícula de tarjetas de perritos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {perritos.map((perro) => (
            <div key={perro.id} className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <div className="h-48 w-full relative bg-gray-200">
                  <img src={perro.imagen} alt={perro.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-bold text-gray-900">{perro.nombre}</h2>
                  <p className="text-sm text-gray-500 mt-1">{perro.raza} • {perro.edad}</p>
                </div>
              </div>
              <div className="p-5 pt-0">
                {/* Enlace hacia la ruta dinámica de detalle: /perros/[id] */}
                <Link
                  href={`/perros/${perro.id}`}
                  className="block text-center w-full bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold py-2.5 rounded-xl transition shadow-sm"
                >
                  Ver Detalle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}