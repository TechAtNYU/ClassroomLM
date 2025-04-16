import { createClient } from "@shared/utils/supabase/server";
import { notFound } from "next/navigation";

import AugmentComponent from "./AugmentNotes";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;

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
      <AugmentComponent classroomId={classroomId} />
    </>
  );
}
