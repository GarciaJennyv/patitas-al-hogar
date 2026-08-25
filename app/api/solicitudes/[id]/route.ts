import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Obtener una solicitud por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('solicitudes_adopcion')
      .select(`
        *,
        mascotas (*),
        refugios (*)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Cambiar el estado de la solicitud (pendiente, aprobada, rechazada)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { usuario_id, estado, observaciones } = body;

    // 1. Validar que se reciba el estado
    const estadosValidos = ['pendiente', 'aprobada', 'rechazada'];
    if (!estado || !estadosValidos.includes(estado)) {
      return NextResponse.json(
        { error: 'Estado no válido. Debe ser: pendiente, aprobada o rechazada.' },
        { status: 400 }
      );
    }

    // 2. Verificar rol del usuario que intenta actualizar
    if (!usuario_id) {
      return NextResponse.json(
        { error: 'El usuario_id es requerido para validar permisos.' },
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
        { error: 'No tienes permisos para modificar el estado de la solicitud.' },
        { status: 403 }
      );
    }

    // 3. Actualizar la solicitud
    const updateData: Record<string, any> = { estado };
    if (observaciones !== undefined) updateData.observaciones = observaciones;

    const { data: solicitudActualizada, error: updateError } = await supabase
      .from('solicitudes_adopcion')
      .update(updateData)
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    // 4. Si la solicitud fue aprobada, actualizar el estado de la mascota a 'adoptado'
    if (estado === 'aprobada' && solicitudActualizada[0]?.mascota_id) {
      await supabase
        .from('mascotas')
        .update({ estado: 'adoptado' })
        .eq('id', solicitudActualizada[0].mascota_id);
    }

    return NextResponse.json({ ok: true, data: solicitudActualizada[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}