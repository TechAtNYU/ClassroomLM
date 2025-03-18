"use server";
import { createServiceClient } from "@/utils/supabase/service-server";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/utils/supabase/database.types";

export interface ClassroomWithMembers extends Tables<"Classroom"> {
  Classroom_Members?: Array<{
    id: number;
    classroom_id: number;
    user_id: string;
  }>;
}

export async function getUserClassrooms(): Promise<ClassroomWithMembers[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("Classroom").select(
    `
      *,
      Classroom_Members (
        id,
        classroom_id,
        user_id
      )
    `
  );
  if (error) {
    throw new Error(error.message);
  }

  return (data as ClassroomWithMembers[]) || [];
}

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

export async function deleteClassroom(classroom_id: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Classroom")
    .delete()
    .eq("id", classroom_id);
  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function leaveClassroom(classroom_id: number, user_id: string) {
  // TODO: need to implement this
  console.log("UNIMPLEMENTED LEAVE FOR: ", classroom_id, user_id);
  return;
}

export async function retrieveClassroomData(userId: string) {
  const classrooms = await getUserClassrooms();

  if (!classrooms || classrooms.length === 0) {
    return;
  }

  const validAdminClasses = classrooms.filter(
    (classroom) => classroom.admin_user_id == userId
  );

  const validNonAdminClasses = classrooms.filter(
    (classroom) => classroom.admin_user_id != userId
  );

  return { validAdminClasses, validNonAdminClasses };
}

export async function inviteMemberToClassroom(
  email: string,
  classroom_id: number
) {
  const supabase = createServiceClient();

  const { data: users, error: userError } = await supabase
    .from("Users")
    .select("id")
    .eq("email", email)
    .single();

  if (userError || !users) {
    throw new Error("User does not exist");
  }

  const { data: member } = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("classroom_id", classroom_id)
    .eq("user_id", users.id);

  if (member && member.length > 0) {
    throw new Error("User already in the classroom");
  }

  const { error: insertError } = await supabase
    .from("Classroom_Members")
    .insert({
      classroom_id: classroom_id,
      user_id: users.id,
    });

  if (insertError) {
    throw new Error("Error inserting classroom member");
  }
  return true;
}
