import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const rolFiltro = searchParams.get('rol');

    if (!usuario_id) {
      return NextResponse.json(
        { ok: false, error: 'El usuario_id es obligatorio.' },
        { status: 400 }
      );
    }

    // Verificar si el usuario que consulta es admin buscando en 'profiles'
    const { data: usuarioActual, error: errorUser } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', usuario_id)
      .maybeSingle();

    if (errorUser || !usuarioActual || usuarioActual.rol !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Acceso denegado.' }, { status: 403 });
    }

    // Obtener todos los perfiles de la tabla 'profiles'
    let query = supabase.from('profiles').select('*');

    if (rolFiltro) {
      query = query.eq('rol', rolFiltro);
    }

    const { data: perfiles, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, data: perfiles || [] });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}