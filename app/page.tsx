export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden flex items-center bg-zinc-900">
      {/* Imagen de fondo del perrito sentado */}
      <div className="absolute inset-0 z-0">
        <img
          src="amigo.jpg" 
          alt="Tu mejor amigo está esperando por ti"
          className="w-full h-full object-cover object-right sm:object-center opacity-75"
        />
        {/* Capa oscura semitransparente para que el texto resalte perfectamente */}
        <div className="absolute inset-0 bg-black/40 sm:bg-black/25" />
      </div>

      {/* Contenido de texto alineado a la izquierda */}
      <div className="relative z-10 px-8 sm:px-16 md:px-24 max-w-2xl text-white">
        <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Tu mejor <span className="text-[#f4c430]">amigo</span> está esperando por <span className="text-[#f4c430]">ti.</span>
        </h1>

        {/* Línea divisoria con el corazón */}
        <div className="flex items-center gap-3 my-6">
          <hr className="w-12 border-t-2 border-[#f4c430]" />
          <span className="text-xl">💛</span>
          <hr className="w-12 border-t-2 border-[#f4c430]" />
        </div>

        <p className="text-lg sm:text-xl font-normal leading-relaxed text-zinc-100">
          Adopta, cambia una vida y gana un compañero para siempre.
        </p>
      </div>
    </main>
  );
}