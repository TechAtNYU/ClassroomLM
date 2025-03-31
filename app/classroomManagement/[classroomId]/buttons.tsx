// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";
"use client";
import {
  archiveClassroom,
  changeClassroomName,
  deleteClassroom,
} from "../../classroom/actions";
import InviteMember from "./inviteMember";

interface ClassroomManagementButtonsProps {
  classroomId: number;
}

export default function ClassroomManagementButtons({
  classroomId,
}: ClassroomManagementButtonsProps) {
  //   const userId = await getCurrentUserId();
  //   const classData = await retrieveClassroomData(userId);
  const classroomIdNumber = Number(classroomId);

  const archiveClassroomFunction = async (classroomId: number) => {
    try {
      await archiveClassroom(classroomId);
    } catch {
      console.error("Error occurred while archiving the classroom");
    }
  };

  const handleChangeClassroomName = async (classroomId: number) => {
    const newName = window.prompt("Enter new class name:");
    if (newName !== null && newName !== "") {
      try {
        await changeClassroomName(classroomId, newName);
      } catch (error) {
        console.error("Error changing classroom name:", error);
      }
    }
  };

  const deleteClassroomFunction = async (classroomId: number) => {
    const confirmation = window.confirm(
      "Are you sure? This action can't be undone."
    );
    if (confirmation) {
      try {
        await deleteClassroom(classroomId);
      } catch (error: unknown) {
        // Handle the error, checking if it is an instance of Error
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Error occurred");
        }
      }
    } else {
      console.log("Classroom deletion cancelled.");
    }
  };

  return (
    <div>
      {/* ARCHIVE BUTTON */}
      <button
        type="button"
        className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
        onClick={() => archiveClassroomFunction(classroomIdNumber)}
      >
        Archive
      </button>

      <button
        type="button"
        className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
        onClick={() => deleteClassroomFunction(classroomIdNumber)}
      >
        Delete
      </button>

      {/* CHANGE NAME BUTTON */}
      <button
        onClick={() => handleChangeClassroomName(classroomIdNumber)}
        type="button"
        className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
      >
        Change Name
      </button>

      <p>Invite Member:</p>
      <InviteMember classroomId={classroomId} />
    </div>
  );
}
