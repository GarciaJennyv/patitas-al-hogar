import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos Service Role Key para permitir inserts administrativos sin bloqueo de RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    const { email, password, nombre, rol, cedula, telefono } = await request.json();

    console.log("--> Solicitud de registro recibida para:", email);

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          rol: rol || 'adoptante',
        },
      },
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

    // 2. Insertar o actualizar el perfil en la tabla 'profiles'
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: userId,
          nombre: nombre || 'Usuario sin nombre',
          email: email,
          rol: rol || 'adoptante',
          cedula: cedula || null,
          telefono: telefono || null,
          created_at: new Date().toISOString(),
        },
      ], { onConflict: 'id' })
      .select();

    if (profileError) {
      console.error("❌ Error al guardar en profiles:", profileError.message);
      return NextResponse.json(
        { 
          error: "Error en Base de Datos", 
          code: profileError.code, 
          details: profileError.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
      profile: profileData?.[0] || null,
    });

  } catch (error: any) {
    console.error("💥 Error interno del servidor:", error);
    return NextResponse.json({ error: "Error interno en el servidor" }, { status: 500 });
  }
}