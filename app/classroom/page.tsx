// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

import { getCurrentUserId, retrieveClassroomData } from "./actions";
import ClassroomList from "./classroomList";
export default async function ClassroomPage() {
  const userId = await getCurrentUserId();

  const classData = await retrieveClassroomData(userId);
  if (!classData) {
    return <div>No classrooms found!</div>;
  }
  return (
    <ClassroomList
      userId={userId}
      initialAdminData={classData?.validAdminClasses}
      initialMemberData={classData?.validNonAdminClasses}
    />
  );
}
