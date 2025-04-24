import { NextRequest } from "next/server";
import { createServiceClient } from "@shared/utils/supabase/service-server";
import { getCurrentUserIdServer } from "@shared/lib/supabase/shared";
import { redirect } from "next/navigation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  //await params
  const { code } = await params;

  //bypass RLS
  const supabase = createServiceClient();

  //get classroom with code
  const { data: classroom, error: classroomError } = await supabase
    .from("Classrooms")
    .select("*")
    .eq("join_code", code.toLowerCase())
    .single();

  if (classroomError || !classroom) {
    console.error("Classroom not found:", classroomError);
    return redirect("/classrooms");
  }

  //ensures that the user is authenticated
  const userId = await getCurrentUserIdServer();

  if (!userId) {
    console.error("User is not authenticated");
    //login page
    return redirect("/classrooms/login");
  }

  //if the person is already in there, should be redirect to just classroom
  const { data: existingMember, error: memberError } = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("classroom_id", classroom.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberError) {
    console.error("Error checking membership:", memberError);
    return redirect("/classrooms");
  }

  if (existingMember) {
    return redirect("/classrooms");
  }

  const { error: insertError } = await supabase
    .from("Classroom_Members")
    .insert({
      classroom_id: classroom.id,
      user_id: userId,
    });

  if (insertError) {
    console.error("Error adding member to classroom:", insertError);
    return redirect("/classrooms");
  }
  //redirect to classroom

  const successParams = new URLSearchParams({
    joinSuccess: classroom.id.toString(),
  });
  return redirect(`/classrooms?${successParams.toString()}`);
}
