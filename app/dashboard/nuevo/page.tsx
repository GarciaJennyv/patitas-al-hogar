import Link from "next/link";
import { crearMascota } from "@/app/dashboard/nuevo/actions";
import { ArrowLeft, PawPrint, Image as ImageIcon, FileText, Dog, Calendar } from "lucide-react";

export default function NuevoMascotaPage() {
  return (
    <main className="min-h-screen bg-stone-900 text-white p-6 md:p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Navegación de retorno */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#f4c430] hover:underline mb-8 font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </Link>

        {/* Tarjeta del Formulario */}
        <div className="bg-stone-800 border border-stone-700 p-8 rounded-3xl shadow-2xl">
          
          {/* Encabezado */}
          <div className="flex items-center gap-3 mb-6 border-b border-stone-700 pb-4">
            <div className="bg-stone-900 p-3 rounded-2xl border border-stone-700 text-[#f4c430]">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Publicar Nueva Mascota</h1>
              <p className="text-stone-400 text-xs mt-0.5">
                Ingresa los datos para registrar la publicación mediante Server Action.
              </p>
            </div>
          </div>

          {/* Formulario que consume la Server Action */}
          <form action={crearMascota} className="space-y-5">
            
            {/* Nombre */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                <Dog className="w-3.5 h-3.5 text-stone-400" /> Nombre *
              </label>
              <input 
                name="nombre" 
                placeholder="Ej. Max" 
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm" 
                required 
              />
            </div>

            {/* Raza y Edad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5">
                  Raza *
                </label>
                <input 
                  name="raza" 
                  placeholder="Ej. Golden Retriever, Mestizo" 
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" /> Edad *
                </label>
                <input 
                  name="edad" 
                  placeholder="Ej. 2 años" 
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm" 
                  required 
                />
              </div>
            </div>

            {/* URL de la Imagen */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-stone-400" /> URL de la Imagen *
              </label>
              <input 
                name="imagen" 
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg" 
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm" 
                required 
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs uppercase font-bold tracking-wider text-stone-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone-400" /> Descripción / Historia *
              </label>
              <textarea 
                name="descripcion" 
                rows={3}
                placeholder="Escribe sobre su temperamento, estado de salud o historia..." 
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f4c430] text-sm resize-none" 
                required 
              />
            </div>

            {/* Botón Submit */}
            <button 
              type="submit" 
              className="w-full bg-[#f4c430] hover:bg-[#e0b020] text-stone-900 font-extrabold py-3.5 rounded-xl transition shadow-lg mt-4 cursor-pointer text-sm"
            >
              Publicar Mascota
            </button>

          </form>

        </div>
      </div>
    </main>
  );
}