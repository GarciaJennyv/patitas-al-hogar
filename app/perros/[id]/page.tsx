import Image from "next/image";
import Link from "next/link";

// Base de datos simulada (puedes adaptarla con los datos reales de tus perritos)
const perrosData: Record<string, any> = {
  "1": {
    nombre: "Max",
    raza: "Golden Retriever • 2 años",
    imagen: "/amigo.jpg", // O la ruta de tu imagen
    descripcion: "Max es un perrito muy amigable, enérgico y le encanta jugar con los niños.",
    refugio: "Refugio Patitas Felices",
    ubicacion: "Quito, Ecuador"
  },
  "2": {
    nombre: "Luna",
    raza: "Pastor Alemán • 1 año",
    imagen: "/amigo.jpg",
    descripcion: "Luna es inteligente, obediente y aprende muy rápido.",
    refugio: "Amigos de Cuatro Patas",
    ubicacion: "Cumbayá, Ecuador"
  },
  "3": {
    nombre: "Rocky",
    raza: "Labrador • 3 años",
    imagen: "/amigo.jpg",
    descripcion: "A Rocky le encanta nadar, buscar la pelota y es muy cariñoso.",
    refugio: "Salvando Huellas",
    ubicacion: "Los Chillos, Ecuador"
  }
};

export default async function DetallePerroPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const perro = perrosData[id];

  if (!perro) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-900 text-white">
        <h1 className="text-2xl font-bold mb-4">Perrito no encontrado</h1>
        <Link href="/perros" className="bg-[#f4c430] text-stone-900 px-6 py-2 rounded-full font-bold">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white p-6 md:p-12 flex items-center justify-center">
      <div className="max-w-3xl w-full bg-white text-stone-900 rounded-3xl overflow-hidden shadow-2xl p-8">
        
        <Link href="/perros" className="text-emerald-700 font-bold hover:underline mb-6 inline-block">
          ← Volver al listado
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-md">
            <img src={perro.imagen} alt={perro.nombre} className="w-full h-full object-cover" />
          </div>

          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 mb-2">{perro.nombre}</h1>
            <p className="text-emerald-700 font-semibold mb-4">{perro.raza}</p>
            <p className="text-stone-600 text-sm mb-6 leading-relaxed">{perro.descripcion}</p>
            
            <div className="bg-stone-100 p-4 rounded-xl mb-6 text-sm text-stone-700">
              <p><strong>Refugio:</strong> {perro.refugio}</p>
              <p><strong>Ubicación:</strong> {perro.ubicacion}</p>
            </div>

            <button className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition">
              Solicitar Adopción
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}