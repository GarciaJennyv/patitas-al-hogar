import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Resolver params con await
    const { id } = await params;

    const body = await request.json();
    const { usuario_id, estado, rol } = body;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: 'El ID del refugio/usuario es obligatorio' },
        { status: 400 }
      );
    }

    // 2. Actualizar perfil del refugio
    const { data, error } = await supabase
      .from('profiles')
      .update({
        rol: rol || 'adoptante',
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error Supabase al revocar:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('Error Server al revocar:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
