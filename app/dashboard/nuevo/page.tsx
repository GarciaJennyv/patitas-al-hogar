import { crearMascota } from "./actions";
import Link from "next/link";
import { ArrowLeft, PlusCircle } from "lucide-react";

export default function NuevaMascotaPage() {
  const usuarioRefugioId = "TU_USER_UUID_DE_PRUEBA"; 

  return (
    <main className="min-h-screen bg-stone-900 text-white p-6 md:p-12">
      <div className="max-w-xl mx-auto bg-stone-800 border border-stone-700 rounded-3xl p-8 shadow-2xl">
        
        <Link href="/perros" className="inline-flex items-center gap-2 text-[#f4c430] hover:underline mb-6 font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <PlusCircle className="w-8 h-8 text-[#f4c430]" />
          <h1 className="text-2xl font-extrabold">Publicar Nueva Mascota</h1>
        </div>

        <form action={crearMascota} className="space-y-4">
          <input type="hidden" name="user_id" value={usuarioRefugioId} />

          <div>
            <label className="block text-sm font-medium mb-1">Nombre de la mascota</label>
            <input
              type="text"
              name="nombre"
              required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="Ej. Max"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Raza</label>
            <input
              type="text"
              name="raza"
              required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="Ej. Labrador Retriever"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Edad</label>
            <input
              type="text"
              name="edad"
              required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="Ej. 2 años"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL de la imagen</label>
            <input
              type="url"
              name="imagen"
              required
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción / Historia</label>
            <textarea
              name="descripcion"
              required
              rows={4}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430]"
              placeholder="Escribe detalles sobre su comportamiento, vacunas o historia..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-bold py-3 rounded-xl transition shadow-lg mt-2"
          >
            Guardar y Publicar Mascota
          </button>
        </form>
      </div>
    </main>
  );
}