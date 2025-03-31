// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";

import ClassroomManagementButtons from "./buttons";
import Link from "next/link";

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
      <Link href={`../classroom`} passHref>
        <button
          type="button"
          className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
        >
          Classroom Page
        </button>
      </Link>
    </div>
  );
}
