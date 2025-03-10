"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw Error("No authenticated user found");
  }
  return user.id;
}

export async function getRagflowDatasetId(classroomId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Classroom")
    .select("ragflow_dataset_id")
    .eq("id", classroomId)
    .single();

  if (error) {
    console.error("Error fetching classroom:", error);
    throw new Error(`Failed to fetch classroom: ${error.message}`);
  }

  if (!data) {
    throw new Error(`No classroom found with id: ${classroomId}`);
  }

  return data.ragflow_dataset_id;
}
