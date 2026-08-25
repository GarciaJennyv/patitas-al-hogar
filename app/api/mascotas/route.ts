import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Obtener todas las mascotas
export async function GET() {
  try {
    const { data: mascotas, error } = await supabase
      .from('mascotas')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: mascotas });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Registrar una nueva mascota
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      usuario_id,
      nombre,
      raza,
      edad,
      refugio_id,
      estado,
      descripcion,
      imagen_url,
      especie,
      sexo,
      tamano,
      peso,
      salud
    } = body;

    // 1. Validar que vengan los datos obligatorios
    if (!usuario_id || !nombre) {
      return NextResponse.json(
        { error: 'El usuario_id y el nombre de la mascota son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Verificar el rol del usuario en la tabla 'profiles'
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (perfilError || !perfil) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // 3. Validar si el rol es 'admin' o 'refugio'
    const esPermitido = perfil.rol === 'admin' || perfil.rol === 'refugio';
    if (!esPermitido) {
      return NextResponse.json(
        { error: 'No tienes permisos para agregar mascotas.' },
        { status: 403 }
      );
    }

    // 4. Insertar la mascota en la base de datos
    const { data: nuevaMascota, error: insertError } = await supabase
      .from('mascotas')
      .insert([
        {
          nombre,
          raza,
          edad,
          refugio_id,
          estado: estado || 'disponible',
          descripcion,
          imagen_url,
          especie,
          sexo,
          tamano,
          peso,
          salud,
        },
      ])
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: nuevaMascota[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}