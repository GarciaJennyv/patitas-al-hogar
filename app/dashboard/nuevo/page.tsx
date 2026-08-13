import { crearMascota } from "@/app/dashboard/nuevo/actions";

export default function NuevoMascotaPage() {
  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Publicar nueva mascota</h1>
      <form action={crearMascota} className="space-y-4">
        <input name="nombre" placeholder="Nombre" className="w-full p-2 border rounded" required />
        <input name="raza" placeholder="Raza" className="w-full p-2 border rounded" required />
        <input name="edad" placeholder="Edad" className="w-full p-2 border rounded" required />
        <textarea name="descripcion" placeholder="Descripción" className="w-full p-2 border rounded" required />
        <input name="imagen" placeholder="URL de la imagen" className="w-full p-2 border rounded" required />
        
        <button type="submit" className="bg-amber-400 text-white font-bold py-2 px-6 rounded-full">
          Publicar Mascota
        </button>
      </form>
    </main>
  );
}