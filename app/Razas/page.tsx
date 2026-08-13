import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

// Definición de la interfaz de la API
interface RazaPerro {
  id: number;
  name: string;
  temperament?: string;
  bred_for?: string;
  image?: {
    id: string;
    url: string;
  };
}

// Función para hacer el fetch desde un Server Component
async function obtenerRazasExternas(): Promise<RazaPerro[]> {
  try {
    const res = await fetch("https://api.thedogapi.com/v1/breeds?limit=8", {
      // Revalida la respuesta cada 3600 segundos (1 hora)
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error("No se pudo conectar con la API externa de razas");
    }

    return await res.json();
  } catch (error) {
    console.error("Error al consumir la API externa:", error);
    return []; // Retornamos un arreglo vacío para manejar el error de forma limpia
  }
}

export default async function RazasExternasPage() {
  const razas = await obtenerRazasExternas();

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

        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Catálogo de Referencia (API Externa)
          </h1>
          <p className="text-stone-400 max-w-2xl mx-auto text-sm md:text-base">
            Información y características de distintas razas obtenidas en tiempo real desde The Dog API para complementar nuestra plataforma de adopción.
          </p>
        </div>

        {/* Manejo de errores o datos vacíos */}
        {razas.length === 0 ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 p-6 rounded-2xl flex items-center gap-4 max-w-lg mx-auto">
            <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
            <p className="text-sm">
              Lo sentimos, en este momento el servicio externo no está disponible o tardó demasiado en responder. Intenta recargar la página más tarde.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {razas.map((raza) => (
              <div 
                key={raza.id} 
                className="bg-stone-800 border border-stone-700 rounded-2xl overflow-hidden shadow-lg flex flex-col transition hover:border-[#f4c430]"
              >
                <div className="relative h-48 w-full bg-stone-900">
                  {raza.image?.url ? (
                    <img 
                      src={raza.image.url} 
                      alt={raza.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-stone-500 text-xs">
                      Sin imagen disponible
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{raza.name}</h2>
                    <p className="text-stone-400 text-xs mb-3 line-clamp-2">
                      <strong className="text-stone-300">Temperamento:</strong> {raza.temperament || "No especificado"}
                    </p>
                  </div>
                  
                  {raza.bred_for && (
                    <span className="inline-block bg-stone-900 text-[#f4c430] text-[11px] px-3 py-1 rounded-full font-medium self-start border border-stone-700">
                      Uso: {raza.bred_for}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}