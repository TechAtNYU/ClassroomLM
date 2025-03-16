// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

import Link from "next/link";
import {
  deleteClassroom,
  getUserClassrooms,
  getCurrentUserId,
} from "./actions";
import InviteMember from "./inviteMember";
export default async function ClassroomPage() {
  const classrooms = await getUserClassrooms();

  if (!classrooms || classrooms.length === 0) {
    return <div>No classrooms found!</div>;
  }

  const userId = await getCurrentUserId();

  const validAdminClasses = classrooms.filter(
    (classroom) => classroom.admin_user_id == userId
  );

  const validNonAdminClasses = classrooms.filter(
    (classroom) => classroom.admin_user_id != userId
  );

  return (
    <>
      <div style={{ padding: 20 }}>
        <h1>User ID: {userId}</h1>
        <h1 className={"mb-5 text-center text-3xl underline"}>My Classrooms</h1>
        <h2 className={"text-center text-2xl"}>Admin Classrooms</h2>

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
              <h1 className={"text-xl"}>{classroom.name}</h1>
              <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p>
              <InviteMember classroomId={classroom.id} />
              <button
                type="button"
                className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={deleteClassroomWithId}
              >
                Delete Classroom
              </button>
              <hr className="my-5 h-px border-0 bg-gray-800 dark:bg-white" />
            </div>
          );
        })}

        <hr className="my-5 h-1 border-0 bg-gray-800 dark:bg-white" />

        <h2 className={"text-center text-2xl"}>Member Classrooms</h2>

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
              <h1 className={"text-xl"}>{classroom.name}</h1>
              <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p>
              <InviteMember classroomId={classroom.id} />
              <button
                type="button"
                className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
              >
                Leave Classroom
              </button>
              {/* <button
                type="button"
                className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={deleteClassroomWithId}
              >
                Delete Classroom
              </button> */}

              <hr className="my-5 h-px border-0 bg-gray-800 dark:bg-white" />
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
              <h1 className={"text-xl"}>{classroom.name}</h1>
              <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p>
              <InviteMember classroomId={classroom.id} />
              <button
                type="button"
                className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
              >
                Leave Classroom
              </button>
              {/* <button
                type="button"
                className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={deleteClassroomWithId}
              >
                Delete Classroom
              </button> */}
              <InviteMember classroomId={classroom.id} />
              <button
                type="button"
                className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
              >
                Leave Classroom
              </button>
              {/* <button
                type="button"
                className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={deleteClassroomWithId}
              >
                Delete Classroom
              </button> */}

              <hr className="my-5 h-px border-0 bg-gray-800 dark:bg-white" />
            </div>
          );
        })}

        <Link href="newClassroom/">
          <button
            type="button"
            className="dark:focus:green-red-900 mb-2 me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white"
          >
            Create a Classroom
          </button>
        </Link>
      </div>
    </>
  );
}
