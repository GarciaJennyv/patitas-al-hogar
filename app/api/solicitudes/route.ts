import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adoptante_id = searchParams.get('adoptante_id');
    const refugio_id = searchParams.get('refugio_id');

    // Consulta a la tabla de solicitudes sin joins automáticos
    let query = supabase.from('solicitudes_adopcion').select('*');

    if (adoptante_id) {
      query = query.eq('adoptante_id', adoptante_id);
    }

    if (refugio_id) {
      query = query.eq('refugio_id', refugio_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error Supabase solicitudes:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data: data || [] });
  } catch (error: any) {
    console.error('Error Server solicitudes:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}