import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 👈 Declaramos params como Promise
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

    // 2. Si la revocación implica cambiar el rol o estado en la tabla 'profiles'
    const { data, error } = await supabase
      .from('profiles')
      .update({
        rol: rol || 'adoptante', // Al revocar, se puede cambiar el rol de 'refugio' a 'adoptante'
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