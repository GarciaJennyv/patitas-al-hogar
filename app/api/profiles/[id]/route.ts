import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Obtener el perfil completo de un usuario por su ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: perfil, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !perfil) {
      return NextResponse.json(
        { error: 'Perfil de usuario no encontrado.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: perfil });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Editar datos personales del usuario (adoptante, refugio o admin)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      usuario_id, // ID de quien solicita el cambio (para validación de seguridad)
      nombres_apellidos,
      cedula,
      telefono,
      direccion,
      ciudad,
      tipo_vivienda,
      vivienda_propia,
      tiene_patio,
      rol, // El rol solo debe ser editable bajo ciertas reglas
    } = body;

    // 1. Validar que se envíe el usuario que ejecuta la acción
    if (!usuario_id) {
      return NextResponse.json(
        { error: 'El usuario_id es requerido para autenticar la solicitud.' },
        { status: 400 }
      );
    }

    // 2. Verificar el rol de quien ejecuta la petición
    const { data: ejecutor, error: ejecutorError } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', usuario_id)
      .single();

    if (ejecutorError || !ejecutor) {
      return NextResponse.json({ error: 'Usuario ejecutor no encontrado.' }, { status: 404 });
    }

    // Regla de seguridad: Un usuario solo puede editar su propio perfil, a menos que sea 'admin'
    const esElMismoUsuario = usuario_id === id;
    const esAdmin = ejecutor.rol === 'admin';

    if (!esElMismoUsuario && !esAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este perfil.' },
        { status: 403 }
      );
    }

    // 3. Preparar los datos a actualizar
    const datosActualizar: Record<string, any> = {
      nombres_apellidos,
      cedula,
      telefono,
      direccion,
      ciudad,
      tipo_vivienda,
      vivienda_propia,
      tiene_patio,
    };

    // Solo un administrador puede cambiar el ROL de un usuario
    if (rol !== undefined && esAdmin) {
      datosActualizar.rol = rol;
    }

    // Limpiar claves undefined para no sobreescribir con valores nulos no deseados
    Object.keys(datosActualizar).forEach(
      (key) => datosActualizar[key] === undefined && delete datosActualizar[key]
    );

    // 4. Ejecutar la actualización en Supabase
    const { data: perfilActualizado, error: updateError } = await supabase
      .from('profiles')
      .update(datosActualizar)
      .eq('id', id)
      .select();

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true, data: perfilActualizado[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}