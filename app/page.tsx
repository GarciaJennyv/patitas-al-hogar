import Link from "next/link";

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
        {/* Capa oscura semitransparente */}
        <div className="absolute inset-0 bg-black/40 sm:bg-black/25" />
      </div>

      {/* 🐾 BOTÓN PANEL ADMIN (Ubicado en la parte superior DERECHA) */}
      <div className="absolute top-6 right-6 z-20">
        <Link
          href="/loginadmin"
          className="group flex items-center gap-2 bg-amber-100/90 hover:bg-amber-400 text-gray-900 font-bold px-4 py-2 rounded-xl border border-amber-300 transition shadow-md cursor-pointer"
        >
          <span className="text-lg group-hover:animate-bounce">🐾</span>
          <span className="text-xs sm:text-sm">Panel</span>
        </Link>
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

        <p className="text-lg sm:text-xl font-normal leading-relaxed text-zinc-100 mb-8">
          Adopta, cambia una vida y gana un compañero para siempre.
        </p>

        {/* Botón Adoptar Ahora */}
        <Link
          href="/perros"
          className="inline-flex items-center space-x-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-3.5 rounded-full shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
        >
          <span>🐾</span>
          <span>Adoptar ahora</span>
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </main>
  );
}