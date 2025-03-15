"use server";
import { createClient } from "@/utils/supabase/server";

export async function newClassroom(name: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Classroom")
    .insert([{ name: name, admin_user_id: id }])
    .select();

  if (error) {
    console.error("Error inserting classroom:", error);
    return null;
  }
  return data;
}

// export async function deleteClassroom(classroom_id: number) {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("Classroom")
//     .delete()
//     .eq("id", classroom_id);
//   if (error) {
//     throw new Error(error.message);
//   }
//   return data || [];
// }
