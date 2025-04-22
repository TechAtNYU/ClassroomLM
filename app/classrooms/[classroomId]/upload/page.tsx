import { notFound } from "next/navigation";
import { createClient } from "@shared/utils/supabase/server";

import UploadComponent from "./uploadComponent";
import { isUserAdminForClassroom } from "./actions";
import { Upload } from "lucide-react";

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
        <h2 className="flex flex-row gap-4 text-2xl font-medium tracking-tight text-muted-foreground">
          <Upload className="self-center" /> Upload materials
        </h2>
      </div>
      <UploadComponent classroomId={classroomId} classroomName={data.name} />
    </>
  );
}
