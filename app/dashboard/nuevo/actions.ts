"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearMascota(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const raza = formData.get("raza") as string;
  const edad = formData.get("edad") as string;
  const descripcion = formData.get("descripcion") as string;
  const imagen = formData.get("imagen") as string;// hasta aqui

  // 1. Obtener sesión actual del usuario desde Supabase
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Debes iniciar sesión para publicar una mascota.");
  }

  // 2. Insertar en la tabla de mascotas vinculando el user_id
  const { error: insertError } = await supabase.from("mascotas").insert([
    {
      nombre,
      raza,
      edad,
      descripcion,
      imagen,
      user_id: user.id,
    },
  ]);// hasta aqui

  if (insertError) {
    console.error("Error Supabase:", insertError.message);
    throw new Error(`No se pudo crear la mascota: ${insertError.message}`);
  }

  // 3. Purgar caché de las rutas que listan mascotas
  revalidatePath("/dashboard");
  revalidatePath("/perros");

  // 4. Redirigir al usuario
  redirect("/dashboard");
}