# Nombre del proyecto
PATITAS AL HOGAR
Plataforma web full-stack diseñada para la gestión de adopciones de mascotas, conectando refugios de animales con adoptantes y administradores de la plataforma.
# Demo en vivo
https://patitas-al-hogar-omega.vercel.app
# Capturas de pantalla
![alt text](<Captura de pantalla (3643).png>)
![alt text](<Captura de pantalla (3642).png>)
![alt text](<Captura de pantalla (3641).png>)
![alt text](<Captura de pantalla (3640).png>)
![alt text](<Captura de pantalla (3644).png>)
![alt text](<Captura de pantalla (3645).png>)
![alt text](<Captura de pantalla (3646).png>)
![alt text](<Captura de pantalla (3647).png>)
![alt text](<Captura de pantalla (3648).png>)
# stak Tecnologico
Framework: Next.js 14 (App Router)

Lenguaje: TypeScript

Estilos: Tailwind CSS

Base de datos y Autenticacion: Supabase (PostgreSQL, Supabase Auth, Row Level Security)

Gestor de paquetes: npm

Despliegue: Vercel
# Roles de usuario
Adoptante: Puede explorar el catalogo de mascotas disponibles, ver detalles de cada animal y enviar solicitudes de adopcion.
Refugio: Administra las mascotas publicadas (crear, editar, eliminar) y gestiona las solicitudes de adopcion recibidas.
Administrador (admin): Acceso total al panel de administracion para supervisar refugios, usuarios y metricas del sistema.
# Modelo de datos
1. auth.users: Tabla interna de Supabase para autenticacion y manejo de credenciales.

2. public.profiles: Almacena informacion complementaria del usuario (id, nombre, email, rol: adoptante, refugio, admin).

3. public.mascotas: Registra las mascotas disponibles para adopcion (id, nombre, especie, edad, refugio_id, estado).

4. public.solicitudes_adopcion: Conecta adoptantes con mascotas (id, mascota_id, usuario_id, estado).

5. public.refugios: Datos institucionales de los refugios registrados.
# INSTALACION LOCAL
# 1. Clonar el repositorio
git clone https://github.com/GarciaJennyv/patitas-al-hogar.git
# 2. Entrar al directorio del proyecto
cd patitas-al-hogar
# 3. Instalar dependencias
npm install
# 4. Configurar variables de entorno (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://jcncigiwcktfsgcwnwaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_g3a2LUbWMOaa1fVPhua6Aw_hZ2C-mkI
# 5. Ejecutar en servidor de desarrollo
npm run dev
Abre http://localhost:3000 en el navegador.
# Credenciales de prueba
Administrador: garciagenith17@gmail.com / 1727078915
adoptante:Marta Perez /marta@gmail.com/ 222222
Refugio:Fundacion Patitas Callejeras/patitascallejeras@gmail.com/333333