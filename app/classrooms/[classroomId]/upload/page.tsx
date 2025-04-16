import { notFound } from "next/navigation";
import { createClient } from "@shared/utils/supabase/server";

import UploadComponent from "./uploadComponent";
import { isUserAdminForClassroom } from "./actions";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  const isAdmin = await isUserAdminForClassroom(Number(classroomId));
  if (!isAdmin) {
    notFound();
  }

  // #TODO: move this out to general supabase place
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Classrooms")
    .select("name")
    .eq("id", Number(classroomId))
    .single();

  if (error || !data || !data.name) {
    console.error("Error fetching classroom or its name:", error);
    notFound();
  }

  return (
    <>
      <h1>Classroom: {data.name}</h1>
      <UploadComponent classroomId={classroomId} classroomName={data.name} />
    </>
  );
}
