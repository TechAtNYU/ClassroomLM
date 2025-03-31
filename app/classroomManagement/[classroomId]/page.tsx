// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";
export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  //   const userId = await getCurrentUserId();
  //   const classData = await retrieveClassroomData(userId);
  const { classroomId } = await params;
  return <h1>Hello this is classroom {classroomId}</h1>;
}
