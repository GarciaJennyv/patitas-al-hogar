import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Panel de Gestión</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Acceso para publicar */}
        <div className="border p-6 rounded-lg shadow-sm hover:border-amber-400 transition">
          <h2 className="text-xl font-semibold mb-2">Publicar Mascota</h2>
          <p className="text-gray-600 mb-4">Añade una nueva mascota al catálogo de adopción.</p>
          <Link 
            href="/dashboard/nuevo" 
            className="inline-block bg-amber-400 text-white font-bold py-2 px-4 rounded-full"
          >
            Nueva Publicación
          </Link>
        </div>

        {/* Podrías agregar más tarjetas aquí (ej: Mis mascotas publicadas, Perfil, etc.) */}
      </div>
    </main>
  );
}