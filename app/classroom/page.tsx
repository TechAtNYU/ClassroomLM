// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
import { deleteClassroom, getUserClassrooms, insertRandom } from "./actions";

export default async function ClassroomPage() {
  const classrooms = await getUserClassrooms();

  if (!classrooms || classrooms.length === 0) {
    return <div>No classrooms found!</div>;
  }

  return (
    <>
      <div style={{ padding: 20 }}>
        <h1 className={"text-2xl"}>My Classrooms</h1>
        {classrooms.map((classroom) => {
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
                Delete classroom
              </button>
              <hr className="my-8 h-px border-0 bg-gray-200 dark:bg-gray-700" />
            </div>
          );
        })}
      </div>
      <button className={"border-2 border-solid"} onClick={insertRandom}>
        insert test
      </button>
    </>
  );
}

// function DeleteButton({ classroomId }: { classroomId: number }){
//   'use client'
//   <button
//   type="button"
//   className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
//   onClick={async () => await deleteClassroom(classroomId)}
// >
//   Delete classroom
// </button>
// }
