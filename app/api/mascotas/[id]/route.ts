import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Obtener una mascota específica por su ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: mascota, error } = await supabase
      .from('mascotas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !mascota) {
      return NextResponse.json(
        { error: 'Mascota no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: mascota });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Actualizar datos de una mascota por su ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { usuario_id, ...datosActualizar } = body;

    if (!usuario_id) {
      return NextResponse.json(
        { error: 'El usuario_id es requerido para verificar permisos.' },
        { status: 400 }
      );
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (perfilError || !perfil) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const esPermitido = perfil.rol === 'admin' || perfil.rol === 'refugio';
    if (!esPermitido) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar mascotas.' },
        { status: 403 }
      );
    }

    const { data: mascotaActualizada, error: updateError } = await supabase
      .from('mascotas')
      .update(datosActualizar)
      .eq('id', id)
      .select();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: mascotaActualizada[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Eliminar una mascota por su ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');

    if (!usuario_id) {
      return NextResponse.json(
        { error: 'Se requiere usuario_id en los parámetros de la URL (?usuario_id=...)' },
        { status: 400 }
      );
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (perfilError || !perfil || (perfil.rol !== 'admin' && perfil.rol !== 'refugio')) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este registro.' },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('mascotas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: 'Mascota eliminada correctamente' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}