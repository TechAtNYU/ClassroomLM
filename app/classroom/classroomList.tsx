"use client";
import { useContext } from "react";
import {
  deleteClassroom,
  leaveClassroom,
  setArchiveStatusClassroom,
} from "./actions";
import Link from "next/link";
import MemberList from "./memberList";
import {
  ClassroomWithMembers,
  getUserAndClassroomData,
} from "../lib/userContext/contextFetcher";
import { UserContext } from "../lib/userContext/userContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { optimisticUpdateAndFetchClassroomData } from "./clientUtils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  // const handleChangeClassroomName = async (classroomId: number) => {
  //   const newName = window.prompt("Enter new class name:");
  //   if (newName !== null && newName !== "") {
  //     optimisticUpdateAndFetchClassroomData(
  //       classroomId,
  //       async () => changeClassroomName(classroomId, newName),
  //       { name: newName },
  //       setUserAndClassData,
  //       refreshClassrooms
  //     );
  //   }
  // };

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
    return (
      <div className="flex flex-wrap justify-start gap-4">
        {classroomList.map((classroom) => {
          return (
            <div key={classroom.id}>
              {!classroom.archived && (
                <Card className="w-[450px]">
                  <CardHeader>
                    <CardTitle>{classroom.name}</CardTitle>
                    <CardDescription>
                      Join Code: {classroom.join_code || "N/A"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TooltipProvider>
                      <Tooltip delayDuration={300}>
                        <TooltipTrigger>Buttons</TooltipTrigger>
                        <TooltipContent>
                          {classroom.Classroom_Members &&
                            classroom.Classroom_Members.length > 0 && (
                              <MemberList
                                classroom={classroom}
                                enableDeletion={false}
                              />
                            )}
                          <Link href={`../chat/${classroom.id}`} passHref>
                            <button
                              type="button"
                              className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                            >
                              Chat!
                            </button>
                          </Link>

                          {!isAdmin && (
                            <button
                              type="button"
                              className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                              onClick={() =>
                                optimisticUpdateAndFetchClassroomData(
                                  classroom.id,
                                  async () =>
                                    leaveClassroom(classroom.id, userId),
                                  "remove",
                                  setUserAndClassData,
                                  refreshClassrooms
                                )
                              }
                            >
                              Leave Classroom
                            </button>
                          )}

                          {isAdmin && (
                            <Link
                              href={`/classroom/${classroom.id}/manage`}
                              passHref
                            >
                              <button
                                type="button"
                                className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                              >
                                Manage Classroom
                              </button>
                            </Link>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* 
                    {isAdmin && (
                      <button
                        onClick={() => handleChangeClassroomName(classroom.id)}
                        type="button"
                        className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                      >
                        Change Name
                      </button>
                    )} */}
                  </CardContent>
                  {/* <CardFooter>
                <p>Card Footer</p>
              </CardFooter> */}
                </Card>
                // <>
                //   <h1 className="text-xl">{classroom.name}</h1>
                //   <h2>Classroom ID: {classroom.id}</h2>
                //   <p>
                //     Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
                //   </p>
                //   <p>Join Code: {classroom.join_code || "N/A"}</p>

                //   {classroom.Classroom_Members &&
                //     classroom.Classroom_Members.length > 0 && (
                //       <MemberList classroom={classroom} />
                //     )}

                //   <InviteMember
                //     classroomId={classroom.id}
                //     onInviteSuccess={refreshClassrooms}
                //   />
                //   <Link href={`../chat/${classroom.id}`} passHref>
                //     <button
                //       type="button"
                //       className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                //     >
                //       Chat!
                //     </button>
                //   </Link>
                //   <button
                //     type="button"
                //     className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                //     onClick={
                //       isAdmin
                //         ? () => deleteClassroomAndFetch(classroom.id)
                //         : () => leaveClassroomAndFetch(classroom.id)
                //     }
                //   >
                //     {isAdmin ? "Delete Classroom" : "Leave Classroom"}
                //   </button>

                //   {isAdmin && (
                //     <button
                //       type="button"
                //       className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
                //       onClick={() => archiveClassroomAndFetch(classroom.id)}
                //     >
                //       Archive
                //     </button>
                //   )}

                //   {isAdmin && (
                //     <Link href={`../upload/${classroom.id}`} passHref>
                //       <button
                //         type="button"
                //         className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                //       >
                //         Upload Materials
                //       </button>
                //     </Link>
                //   )}

                //   {isAdmin && (
                //     <button
                //       onClick={() => handleChangeClassroomName(classroom.id)}
                //       type="button"
                //       className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                //     >
                //       Change Name
                //     </button>
                //   )}

                //   <hr className="my-5 h-px border-0 bg-gray-800 dark:bg-white" />
                // </>
              )}
            </div>
          );
        })}
      </div>
    );
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

              {/* {classroom.Classroom_Members &&
                classroom.Classroom_Members.length > 0 && (
                  <div>
                    <h3>Members:</h3>
                    <ul>
                      {classroom.Classroom_Members.map((member) => (
                        <li key={member.id}>User ID: {member.id}</li>
                      ))}
                    </ul>
                  </div>
                )} */}

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
                  optimisticUpdateAndFetchClassroomData(
                    classroom.id,
                    isAdmin
                      ? async () => deleteClassroom(classroom.id)
                      : async () => leaveClassroom(classroom.id, userId),
                    "remove",
                    setUserAndClassData,
                    refreshClassrooms
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
                    optimisticUpdateAndFetchClassroomData(
                      classroom.id,
                      async () =>
                        setArchiveStatusClassroom(classroom.id, false),
                      { archived: false },
                      setUserAndClassData,
                      refreshClassrooms
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
    </>
  );
}
