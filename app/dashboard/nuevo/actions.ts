"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function crearMascota(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const raza = formData.get("raza") as string;
  const edad = formData.get("edad") as string;
  const descripcion = formData.get("descripcion") as string;
  const imagen = formData.get("imagen") as string;
  
  // Obtener el ID del usuario logueado
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Debes iniciar sesión para publicar.");

  const { error } = await supabase.from("mascotas").insert([
    { nombre, raza, edad, descripcion, imagen, user_id: user.id }
  ]);

  if (error) throw new Error(error.message);

  revalidatePath("/perros");
}