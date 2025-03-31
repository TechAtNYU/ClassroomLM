// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";
"use client";
import { archiveClassroom } from "../../classroom/actions";

interface ClassroomManagementButtonsProps {
  classroomId: number; // Expecting number directly, not an object
}

export default function ClassroomManagementButtons({
  classroomId,
}: ClassroomManagementButtonsProps) {
  //   const userId = await getCurrentUserId();
  //   const classData = await retrieveClassroomData(userId);
  const classroomIdNumber = Number(classroomId);

  const archiveClassroomFunction = async (classroomId: number) => {
    console.log("HEY");
    try {
      console.log("HEY");
      await archiveClassroom(classroomId);
    } catch {
      console.error("Error occurred while archiving the classroom");
    }
  };

  return (
    <div>
      <button
        type="button"
        className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
        onClick={() => archiveClassroomFunction(classroomIdNumber)}
      >
        Archive
      </button>
    </div>
  );
}
