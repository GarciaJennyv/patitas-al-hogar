"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function crearMascota(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const raza = formData.get("raza") as string;
  const edad = formData.get("edad") as string;
  const descripcion = formData.get("descripcion") as string;
  const imagen = formData.get("imagen") as string;
  const user_id = formData.get("user_id") as string;

  if (!nombre || !raza || !edad || !descripcion || !imagen || !user_id) {
    throw new Error("Por favor completa todos los campos requeridos.");
  }

  const { error } = await supabase.from("mascotas").insert([
    {
      nombre,
      raza,
      edad,
      descripcion,
      imagen,
      user_id,
    },
  ]);

  if (error) {
    console.error("Error al registrar la mascota:", error.message);
    throw new Error("No se pudo registrar la mascota en la base de datos.");
  }

  revalidatePath("/perros");
  redirect("/perros");
}