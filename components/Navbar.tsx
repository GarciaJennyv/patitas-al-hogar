import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-50">
      {/* Logo y nombre de la app */}
      <Link href="/" className="flex items-center space-x-2">
        <div className="bg-amber-400 p-2 rounded-full text-white font-bold flex items-center justify-center">
          🐾
        </div>
        <span className="text-xl font-black text-gray-900 tracking-tight">
          Patitas <span className="text-amber-600 font-normal">al Hogar</span>
        </span>
      </Link>
      
      {/* Botón de menú para versiones móviles */}
      <button className="text-gray-700 focus:outline-none md:hidden" aria-label="Abrir menú">
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Enlaces de navegación para pantallas medianas y grandes */}
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-600">
        <Link href="/" className="hover:text-amber-600 transition">Inicio</Link>
        <Link href="/perros" className="hover:text-amber-600 transition">Perros</Link>
        <Link href="/favoritos" className="hover:text-amber-600 transition">Favoritos</Link>
        <Link href="/login" className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-4 py-2 rounded-full transition shadow-sm">
          Iniciar Sesión
        </Link>
      </nav>
    </header>
  );
}