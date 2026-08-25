import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Listar todos los refugios
export async function GET() {
  try {
    const { data: refugios, error } = await supabase
      .from('refugios')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data: refugios });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// POST: Registrar un nuevo refugio (Exclusivo para ADMIN)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      usuario_id, // ID del usuario que realiza la petición
      nombre,
      responsable,
      telefono,
      direccion,
      ciudad,
      correo,
      descripcion,
      ruc_o_identificacion
    } = body;

    if (!usuario_id || !nombre) {
      return NextResponse.json(
        { error: 'El usuario_id y el nombre del refugio son obligatorios.' },
        { status: 400 }
      );
    }

    // 1. Verificar que el usuario tenga rol 'admin'
    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (perfilError || !perfil) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (perfil.rol !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Solo los administradores pueden crear refugios.' },
        { status: 403 }
      );
    }

    // 2. Insertar el refugio
    const { data: nuevoRefugio, error: insertError } = await supabase
      .from('refugios')
      .insert([
        {
          nombre,
          responsable,
          telefono,
          direccion,
          ciudad,
          correo,
          descripcion,
          ruc_o_identificacion
        },
      ])
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ ok: true, data: nuevoRefugio[0] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}