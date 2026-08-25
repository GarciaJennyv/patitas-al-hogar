import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Obtener lista de mascotas (con filtros opcionales)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refugio_id = searchParams.get('refugio_id');
    const estado = searchParams.get('estado');

    let query = supabase.from('mascotas').select('*');

    if (refugio_id) {
      query = query.eq('refugio_id', refugio_id);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data: mascotas, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data: mascotas || [] });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

// POST: Registrar una nueva mascota (requiere rol refugio o admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario_id, nombre, especie, edad, tamano, sexo, descripcion, imagen_url, refugio_id } = body;

    if (!usuario_id || !nombre || !especie) {
      return NextResponse.json(
        { ok: false, error: 'Campos requeridos faltantes (usuario_id, nombre, especie).' },
        { status: 400 }
      );
    }

    // Verificar permisos del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (perfilError || !perfil || (perfil.rol !== 'admin' && perfil.rol !== 'refugio')) {
      return NextResponse.json(
        { ok: false, error: 'No tienes permisos para registrar mascotas.' },
        { status: 403 }
      );
    }

    const { data: nuevaMascota, error: insertError } = await supabase
      .from('mascotas')
      .insert([
        {
          nombre,
          especie,
          edad,
          tamano,
          sexo,
          descripcion,
          imagen_url,
          refugio_id,
          estado: 'disponible',
        },
      ])
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, data: nuevaMascota[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}