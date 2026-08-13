export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans">
      {/* Contenido de la página del Dashboard */}
      {children}
    </div>
  );
}