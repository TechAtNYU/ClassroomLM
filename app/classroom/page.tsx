// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

import { getCurrentUserId, retrieveClassroomData } from "./actions";
import ArchivedClassroomList from "./archivedClassroomList";
import ClassroomList from "./classroomList";
import NewClassroomButton from "./newClassroomButton";
export default async function ClassroomPage() {
  const userId = await getCurrentUserId();

  const classData = await retrieveClassroomData(userId);
  if (!classData) {
    return (
      <>
        <h1>No classrooms found!</h1>
        <NewClassroomButton />
      </>
    );
  }
  return (
    <>
      <ClassroomList
        userId={userId}
        initialAdminData={classData?.validAdminClasses}
        initialMemberData={classData?.validNonAdminClasses}
      />
      <ArchivedClassroomList
        userId={userId}
        initialAdminData={classData?.validAdminClasses}
        initialMemberData={classData?.validNonAdminClasses}
      />
    </>
  );
}
