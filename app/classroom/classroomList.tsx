"use client";
import { useContext } from "react";
import {
  changeClassroomName,
  deleteClassroom,
  leaveClassroom,
  setArchiveStatusClassroom,
} from "./actions";
import InviteMember from "./inviteMember";
import Link from "next/link";
import NewClassroomButton from "./newClassroomButton";
import MemberList from "./memberList";
import {
  ClassroomWithMembers,
  getUserAndClassroomData,
} from "../lib/userContext/contextFetcher";
import { UserContext } from "../lib/userContext/userContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClassroomList() {
  const userContext = useContext(UserContext);
  // If the userContext is undefined still, give loading visual
  if (!userContext) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  // get the data and setter from the context (these are just a regular useState, so treat them like that)
  const { setUserAndClassData, userAndClassData } = userContext;
  const userId = userAndClassData.userData.id;

  /**
   * Called "optimistic" because it changes the data in the UI (eg. the name or deletes
   * the classroom) without waiting for it to see if the actual database was successful.
   * So the flow: update the UI, call the action, refresh with the actual database data
   * (which 99% of the time) will match what you optimistically update with anyway
   * Check uses of this below
   * @param classroomId classId to change
   * @param action action callback to call, just provide an async
   * @param newValue the value to optimistically update the classroom with
   */
  const optimisticUpdateAndFetch = async <K extends keyof ClassroomWithMembers>(
    classroomId: number,
    action: () => Promise<unknown>,
    newValue: { [k in K]: ClassroomWithMembers[k] } | "remove"
  ) => {
    setUserAndClassData((prevData) => ({
      userData: prevData.userData,
      classroomsData: prevData.classroomsData.flatMap((classroom) => {
        console.log(classroom.name);
        if (classroom.id === classroomId) {
          return newValue === "remove" ? [] : { ...classroom, ...newValue };
        }
        return classroom;
      }),
    }));
    await action();
    refreshClassrooms();
  };

  const handleChangeClassroomName = async (classroomId: number) => {
    const newName = window.prompt("Enter new class name:");
    if (newName !== null && newName !== "") {
      optimisticUpdateAndFetch(
        classroomId,
        async () => changeClassroomName(classroomId, newName),
        { name: newName }
      );
    }
  };

  const refreshClassrooms = async () => {
    const refreshedData = await getUserAndClassroomData();
    if (refreshedData) {
      setUserAndClassData(refreshedData);
    }
  };

  function mapToListItem(
    classroomList: ClassroomWithMembers[],
    isAdmin: boolean
  ) {
    return classroomList.map((classroom) => {
      return (
        <div key={classroom.id}>
          {!classroom.archived && (
            <>
              <h1 className="text-xl">{classroom.name}</h1>
              <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p>
              <p>Join Code: {classroom.join_code || "N/A"}</p>

              {classroom.Classroom_Members &&
                classroom.Classroom_Members.length > 0 && (
                  <MemberList classroom={classroom} />
                )}

              <InviteMember
                classroomId={classroom.id}
                onInviteSuccess={refreshClassrooms}
              />
              <Link href={`../chat/${classroom.id}`} passHref>
                <button
                  type="button"
                  className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                >
                  Chat!
                </button>
              </Link>
              <button
                type="button"
                className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={() =>
                  optimisticUpdateAndFetch(
                    classroom.id,
                    isAdmin
                      ? async () => deleteClassroom(classroom.id)
                      : async () => leaveClassroom(classroom.id, userId),
                    "remove"
                  )
                }
              >
                {isAdmin ? "Delete Classroom" : "Leave Classroom"}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                  onClick={() =>
                    optimisticUpdateAndFetch(
                      classroom.id,
                      async () => setArchiveStatusClassroom(classroom.id, true),
                      { archived: true }
                    )
                  }
                >
                  Archive
                </button>
              )}

              {isAdmin && (
                <Link href={`classroom/${classroom.id}/upload`} passHref>
                  <button
                    type="button"
                    className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                  >
                    Upload Materials
                  </button>
                </Link>
              )}

              {isAdmin && (
                <button
                  onClick={() => handleChangeClassroomName(classroom.id)}
                  type="button"
                  className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                >
                  Change Name
                </button>
              )}

              <hr className="my-5 h-px border-0 bg-gray-800 dark:bg-white" />
            </>
          )}
        </div>
      );
    });
  }

  function mapToListItemArchived(
    classroomList: ClassroomWithMembers[],
    isAdmin: boolean
  ) {
    return classroomList.map((classroom) => {
      return (
        <div key={classroom.id}>
          {classroom.archived && (
            <>
              <h1 className="text-xl">{classroom.name}</h1>
              <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p>

              {classroom.Classroom_Members &&
                classroom.Classroom_Members.length > 0 && (
                  <div>
                    <h3>Members:</h3>
                    <ul>
                      {classroom.Classroom_Members.map((member) => (
                        <li key={member.id}>User ID: {member.id}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* <InviteMember
               classroomId={classroom.id}
               onInviteSuccess={refreshClassrooms}
             /> */}
              {/* <Link href={`../chat/${classroom.id}`} passHref>
               <button
                 type="button"
                 className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
               >
                 Chat!
               </button>
             </Link> */}
              <button
                type="button"
                className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                onClick={() =>
                  optimisticUpdateAndFetch(
                    classroom.id,
                    isAdmin
                      ? async () => deleteClassroom(classroom.id)
                      : async () => leaveClassroom(classroom.id, userId),
                    "remove"
                  )
                }
              >
                {isAdmin ? "Delete Classroom" : "Remove Classroom"}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                  onClick={() =>
                    optimisticUpdateAndFetch(
                      classroom.id,
                      async () =>
                        setArchiveStatusClassroom(classroom.id, false),
                      { archived: false }
                    )
                  }
                >
                  Unarchive
                </button>
              )}

              <hr className="my-5 h-px border-0 bg-gray-800 dark:bg-white" />
            </>
          )}
        </div>
      );
    });
  }

  const adminClasses = userAndClassData.classroomsData.filter(
    (classroom) => classroom.admin_user_id == userId
  );

  const memberClasses = userAndClassData.classroomsData.filter(
    (classroom) => classroom.admin_user_id != userId
  );

  return (
    <>
      <div style={{ padding: 20 }}>
        <h1>User ID: {userId}</h1>
        <NewClassroomButton />
        <h1 className={"mb-5 text-center text-3xl underline"}>My Classrooms</h1>
        <h2 className={"text-center text-2xl"}>Admin Classrooms</h2>
        {/* ADMIN CLASSES */}
        {mapToListItem(adminClasses, true)}
        <hr className="my-5 h-1 border-0 bg-gray-800 dark:bg-white" />
        <h2 className={"text-center text-2xl"}>Member Classrooms</h2>
        {/* NON-ADMIN CLASSES */}
        {mapToListItem(memberClasses, false)}
        <hr className="my-5 h-5 border-0 bg-gray-800 dark:bg-white" />
        <h1 className={"mb-5 text-center text-3xl underline"}>
          Archived Classrooms
        </h1>
        <h2 className={"text-center text-2xl"}>Admin Classrooms</h2>
        {mapToListItemArchived(adminClasses, true)}

        <hr className="my-5 h-1 border-0 bg-gray-800 dark:bg-white" />
        <h2 className={"text-center text-2xl"}>Member Classrooms</h2>
        {/* NON-ADMIN CLASSES */}
        {mapToListItemArchived(memberClasses, false)}
        {/* <Link href="newClassroom/">
          <button
            type="button"
            className="dark:focus:green-red-900 mb-2 me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white"
          >
            Create a Classroom
          </button>
        </Link> */}
        {/* <ArchivedClassroomList
          userId={userId}
          initialAdminData={adminClasses}
          initialMemberData={memberClasses}
        /> */}
      </div>
    </>
  );
}
