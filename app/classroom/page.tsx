// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
import {
  deleteClassroom,
  getUserClassrooms,
  getCurrentUserId,
  getClassroomAdminID,
} from "./actions";
import InviteMember from "./inviteMember";
export default async function ClassroomPage() {
  const classrooms = await getUserClassrooms();

  if (!classrooms || classrooms.length === 0) {
    return <div>No classrooms found!</div>;
  }

  const userId = await getCurrentUserId();
  const adminId = await getClassroomAdminID(41);

  const adminClasses = await Promise.all(
    classrooms.map(async (classroom) => {
      const adminId = await getClassroomAdminID(classroom.id); // Wait for the admin_user_id
      return adminId === userId ? classroom : null; // Return the classroom if admin matches, or null
    })
  );

  const validAdminClasses = adminClasses.filter(
    (classroom) => classroom !== null
  );

  const nonAdminClasses = await Promise.all(
    classrooms.map(async (classroom) => {
      const adminId = await getClassroomAdminID(classroom.id); // Wait for the admin_user_id
      return adminId !== userId ? classroom : null; // Return the classroom if admin matches, or null
    })
  );

  const validNonAdminClasses = nonAdminClasses.filter(
    (classroom) => classroom !== null
  );

  return (
    <>
      <div style={{ padding: 20 }}>
        <h1>User ID: {userId}</h1>
        <h1>Classroom Admin ID: {adminId}</h1>
        <h1 className={"text-2xl"}>My Classrooms</h1>
        <h2 className={"text-2xl"}>Admin Classrooms</h2>

        {/* ADMIN CLASSES */}
        {validAdminClasses.map((classroom) => {
          // TODO: should probably move classroom list out to a client component since we need the
          // interactivity of the list changing with updates (eg. delete)
          const deleteClassroomWithId = deleteClassroom.bind(
            null,
            classroom.id
          );
          return (
            <div key={classroom.id}>
              <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p>
              <button
                type="button"
                className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={deleteClassroomWithId}
              >
                Delete Classroom
              </button>
              <InviteMember classroomId={classroom.id} />
              <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
            </div>
          );
        })}

        <h2 className={"text-2xl"}>Member Classrooms</h2>

        {/* NON-ADMIN CLASSES */}
        {validNonAdminClasses.map((classroom) => {
          // TODO: should probably move classroom list out to a client component since we need the
          // interactivity of the list changing with updates (eg. delete)
          // const deleteClassroomWithId = deleteClassroom.bind(
          //   null,
          //   classroom.id
          // );
          return (
            <div key={classroom.id}>
              <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p>
              <button>Leave Classroom</button>
              {/* <button
                type="button"
                className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={deleteClassroomWithId}
              >
                Delete Classroom
              </button> */}
              <InviteMember classroomId={classroom.id} />
              <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
            </div>
          );
        })}
      </div>
    </>
  );
}
