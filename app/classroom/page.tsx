// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

import ClassroomList from "./classroomList";
export default async function ClassroomPage() {
  // This below moved to classroom list itself since we can only retrieve the class data from context
  // within a client component, dont want to make a whole new retrieve just for a check
  // const classData = await retrieveClassroomData(userId);
  // if (!classData) {
  //   return (
  //     <>
  //       <h1>No classrooms found!</h1>
  //       <NewClassroomButton />
  //     </>
  //   );
  // }
  return (
    <>
      <ClassroomList />
    </>
  );
}
