import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Patitas al Hogar",
  description: "Plataforma de adopción de mascotas y gestión de refugios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-900 text-slate-100">
        {/* Navbar superior para pantallas medianas/grandes */}
        <Navbar />

        {/* Contenido principal de tus páginas */}
        <div className="flex-1 pb-16 md:pb-0">{children}</div>

        {/* Barra de navegación inferior fija para móviles */}
        <BottomNav />
      </body>
    </html>
  );
}
