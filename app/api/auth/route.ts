import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Inicializamos el cliente de Supabase con las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  try {
    const { email, password, nombre, rol } = await request.json();

    console.log("--> Solicitud de registro recibida para:", email);

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      console.error("❌ Error en Auth:", authError.message);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "No se pudo obtener el ID del usuario registrado." },
        { status: 400 }
      );
    }

    // 2. Insertar los datos en la tabla 'profiles'
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          nombre: nombre,
          email: email,
          rol: rol || 'adoptante',
        },
      ])
      .select();

    if (profileError) {
      console.error("❌ Error al guardar en profiles:", profileError);
      return NextResponse.json(
        { 
          error: "Error en Base de Datos", 
          code: profileError.code, 
          details: profileError.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: authData.user, profile: profileData });

  } catch (error: any) {
    console.error("💥 Error interno del servidor:", error);
    return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
  }
}