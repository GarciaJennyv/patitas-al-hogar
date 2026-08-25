import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'mascotas'; // Organiza en carpetas ('mascotas', 'refugios', etc.)

    if (!file) {
      return NextResponse.json(
        { ok: false, error: 'No se ha adjuntado ningún archivo.' },
        { status: 400 }
      );
    }

    // Generar un nombre único para evitar sobreescrituras
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Convertir el archivo a Uint8Array para Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Subir archivo al bucket 'mascotas'
    const { data, error } = await supabase.storage
      .from('mascotas')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Error al subir imagen a Supabase Storage:', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Obtener la URL pública de la imagen guardada
    const { data: publicUrlData } = supabase.storage
      .from('mascotas')
      .getPublicUrl(fileName);

    return NextResponse.json({
      ok: true,
      url: publicUrlData.publicUrl,
      path: data.path,
    });
  } catch (error: any) {
    console.error('Error Server en /api/upload:', error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}