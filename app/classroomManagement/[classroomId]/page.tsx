// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";

import ClassroomManagementButtons from "./buttons";

export default async function ClassroomManagementPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  //   const userId = await getCurrentUserId();
  //   const classData = await retrieveClassroomData(userId);
  const { classroomId } = await params;
  const classroomIdNumber = Number(classroomId);

  return (
    <div>
      <h1>Hello this is classroom {classroomId}</h1>
      <ClassroomManagementButtons classroomId={classroomIdNumber} />
    </div>
  );
}
