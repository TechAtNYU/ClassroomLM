"use client";
import { useContext, useEffect } from "react";
import { leaveClassroom, newClassroom } from "./actions";
import Link from "next/link";
import MemberList from "./memberList";
import {
  ClassroomWithMembers,
  getUserAndClassroomData,
} from "../lib/userContext/contextFetcher";
import { UserContext, UserContextType } from "../lib/userContext/userContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  optimisticUpdateAndFetchClassroomData,
  TooltipUtil,
} from "./clientUtils";

import { useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Edit, LogOut, MessageSquareMore, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import SaveClassroomDialog from "./_components/saveClassroomDialog";

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

  return <ClassroomListWithContext userContext={userContext} />;
}

function ClassroomListWithContext({
  userContext,
}: {
  userContext: UserContextType;
}) {
  const searchParams = useSearchParams();

  // get the data and setter from the context (these are just a regular useState, so treat them like that)
  const { setUserAndClassData, userAndClassData } = userContext;

  const userId = userAndClassData.userData.id;

  const refreshClassrooms = async () => {
    const refreshedData = await getUserAndClassroomData();
    if (refreshedData) {
      setUserAndClassData(refreshedData);
    }
  };

  useEffect(() => {
    const joinedClassSuccess = searchParams.get("join_success");
    if (joinedClassSuccess && !isNaN(Number(joinedClassSuccess))) {
      const joinClassInfo = userAndClassData.classroomsData.find(
        (x) => x.id === Number(joinedClassSuccess)
      );
      if (joinClassInfo) {
        // Join class doesn't need to refresh classroom data since we know its fresh
        // since it's coming from a redirect from a reoute
        // router.replace("/classroom", { scroll: false });
        // https://nextjs.org/blog/next-14-1#windowhistorypushstate-and-windowhistoryreplacestate
        // const params = new URLSearchParams(searchParams.toString());
        // params.set('sort', sortOrder);
        if (typeof window !== "undefined") {
          toast({
            description: (
              <div>
                Successfully joined classroom
                <span className="font-bold"> {joinClassInfo.name}</span>!
              </div>
            ),
            duration: 10000,
          });
          window.history.replaceState(null, "", "/classroom");
        }
      }
    }
    // const deleteSuccess = searchParams.get("delete_success");
    // if (deleteSuccess && !isNaN(Number(deleteSuccess))) {
    //   if (typeof window !== "undefined") {
    //     window.history.replaceState(null, "", "/classroom");
    //   }
    //   optimisticUpdateAndFetchClassroomData(
    //     async () => undefined,
    //     "remove",
    //     setUserAndClassData,
    //     Number(deleteSuccess),
    //     refreshClassrooms
    //   );
    // }
  }, [searchParams, userAndClassData.classroomsData]);

  //   const deleteClassSuccess = searchParams.get("delete_success");

  //   if (deleteClassSuccess && !isNaN(Number(deleteClassSuccess))) {
  //     const deleteClassInfo = userAndClassData.classroomsData.find(
  //       (x) => x.id === Number(deleteClassSuccess)
  //     );
  //     if (deleteClassInfo) {
  //       setUserAndClassData(userAndClassData);
  //       // toast({
  //       //   description: (
  //       //     <div>
  //       //       Successfully deleted classroom
  //       //       <span className="font-bold">{deleteClassInfo.name}</span>!
  //       //     </div>
  //       //   ),
  //       //   duration: 10000,
  //       // });
  //     }
  //   }

  //   const archiveClassSuccess = searchParams.get("archiveClassSuccess");

  //   if (archiveClassSuccess && !isNaN(Number(archiveClassSuccess))) {
  //     const archiveClassInfo = userAndClassData.classroomsData.find(
  //       (x) => x.id === Number(archiveClassSuccess)
  //     );
  //     if (archiveClassInfo) {
  //       toast({
  //         description: (
  //           <div>
  //             Successfully archived classroom
  //             <span className="font-bold">{archiveClassInfo.name}</span>!
  //           </div>
  //         ),
  //         duration: 10000,
  //       });
  //       refreshClassrooms();
  //     }
  //   }

  // }, [searchParams]);

  // function mapToListItem(
  //   classroomList: ClassroomWithMembers[],
  //   isAdmin: boolean
  // ) {
  //   return (
  //     <
  //   );
  // }

  // function mapToListItemArchived(
  //   classroomList: ClassroomWithMembers[],
  //   isAdmin: boolean
  // ) {
  //   return classroomList.map((classroom) => {
  //     return (
  //       <div key={classroom.id}>
  //         {classroom.archived && (
  //           <>
  //             <Card className="w-[450px]" animated>
  //               <CardHeader>
  //                 <CardTitle>{classroom.name}</CardTitle>
  //                 {/* <CardDescription>
  //                       Join Code: {classroom.join_code || "N/A"}
  //                     </CardDescription> */}
  //               </CardHeader>
  //               <CardContent>
  //                 {classroom.Classroom_Members &&
  //                   classroom.Classroom_Members.length > 0 && (
  //                     <MemberList
  //                       classroom={classroom}
  //                       enableDeletion={false}
  //                       triggerButton={
  //                         <TooltipProvider>
  //                           <Tooltip delayDuration={300}>
  //                             <SheetTrigger asChild>
  //                               <TooltipTrigger asChild>
  //                                 <Button
  //                                   type="button"
  //                                   variant={"ghost"}
  //                                   size={"iconLg"}
  //                                   // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
  //                                 >
  //                                   <Users className="scale-[200%]" />
  //                                 </Button>
  //                               </TooltipTrigger>
  //                             </SheetTrigger>
  //                             <TooltipContent>View Members</TooltipContent>
  //                           </Tooltip>
  //                         </TooltipProvider>
  //                       }
  //                     />
  //                   )}
  //                 <Button
  //                   type="button"
  //                   variant={"ghost"}
  //                   size={"iconLg"}
  //                   onClick={() =>
  //                     optimisticUpdateAndFetchClassroomData(
  //                       classroom.id,
  //                       isAdmin
  //                         ? async () => deleteClassroom(classroom.id)
  //                         : async () => leaveClassroom(classroom.id, userId),
  //                       "remove",
  //                       setUserAndClassData,
  //                       refreshClassrooms
  //                     )
  //                   }
  //                   // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
  //                 >
  //                   <Trash2 className="scale-[200%]" />
  //                   {isAdmin ? "Delete Classroom" : "Remove Classroom"}
  //                 </Button>

  //                 {isAdmin && (
  //                   <Button
  //                     type="button"
  //                     variant={"ghost"}
  //                     size={"iconLg"}
  //                     // className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
  //                     onClick={() =>
  //                       optimisticUpdateAndFetchClassroomData(
  //                         classroom.id,
  //                         async () =>
  //                           setArchiveStatusClassroom(classroom.id, false),
  //                         { archived: false },
  //                         setUserAndClassData,
  //                         refreshClassrooms
  //                       )
  //                     }
  //                   >
  //                     Unarchive
  //                   </Button>
  //                 )}
  //               </CardContent>{" "}
  //             </Card>

  //             <hr className="my-5 h-px border-0 bg-gray-800 dark:bg-white" />
  //           </>
  //         )}
  //       </div>
  //     );
  //   });
  // }

  const adminClasses = userAndClassData?.classroomsData
    .filter((classroom) => classroom.admin_user_id == userId)
    .sort((x, y) =>
      (x?.name ?? "").toLowerCase().localeCompare((y?.name ?? "").toLowerCase())
    );

  const memberClasses = userAndClassData?.classroomsData
    .filter((classroom) => classroom.admin_user_id != userId)
    .sort((x, y) =>
      (x?.name ?? "").toLowerCase().localeCompare((y?.name ?? "").toLowerCase())
    );

  const addOptimistic = async (newName: string) => {
    return await optimisticUpdateAndFetchClassroomData(
      async () => newClassroom(newName, userId),
      { name: newName, archived: false, admin_user_id: userId, id: -1 },
      setUserAndClassData,
      undefined,
      refreshClassrooms
    );
  };

  const leaveOptimistic = async (classroomId: number) => {
    return await optimisticUpdateAndFetchClassroomData(
      async () => leaveClassroom(classroomId, userId),
      "remove",
      setUserAndClassData,
      classroomId,
      refreshClassrooms
    );
  };

  function ClassroomCard({
    classroom,
    isAdmin,
  }: {
    classroom: ClassroomWithMembers;
    isAdmin: boolean;
  }) {
    return (
      <Card className="w-[450px]" animated>
        <CardHeader>
          <CardTitle>{classroom.name}</CardTitle>
          <CardDescription>
            <div className="flex flex-row gap-3">
              Join Code:{" "}
              {classroom.join_code || (
                <Skeleton className="h-5 w-5/12 self-center" />
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipUtil
            trigger={
              <Button
                type="button"
                variant={"ghost"}
                size={"iconLg"}
                asChild
                // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
              >
                <Link href={`../chat/${classroom.id}`} passHref>
                  <MessageSquareMore className="scale-[200%]" />{" "}
                </Link>
              </Button>
            }
            content={"Chat!"}
          />

          {isAdmin && (
            <TooltipUtil
              trigger={
                <Button
                  type="button"
                  variant={"ghost"}
                  size={"iconLg"}
                  asChild
                  // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                >
                  <Link href={`/classroom/${classroom.id}/manage`} passHref>
                    <Edit className="scale-[200%]" />
                  </Link>
                </Button>
              }
              content={"Manage Classroom"}
            />
          )}

          {classroom.Classroom_Members &&
            classroom.Classroom_Members.length > 0 && (
              <MemberList
                classroom={classroom}
                enableDeletion={false}
                triggerButton={
                  <TooltipUtil
                    trigger={
                      <Button
                        type="button"
                        variant={"ghost"}
                        size={"iconLg"}
                        // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                      >
                        <Users className="scale-[200%]" />
                      </Button>
                    }
                    content={"View Members"}
                    useSheetTrigger
                  />
                }
                userId={userId}
              />
            )}
          {!isAdmin && (
            <TooltipUtil
              trigger={
                <Button
                  type="button"
                  variant={"destructiveGhost"}
                  size={"iconLg"}
                  onClick={() => leaveOptimistic(classroom.id)}
                  // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                >
                  <LogOut className="scale-[200%]" />
                </Button>
              }
              content={"Leave Classroom"}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <SaveClassroomDialog
        // isDialogOpen={isDialogOpen}
        // setIsDialogOpen={setIsDialogOpen}
        optimisticUpdateCallback={addOptimistic}
        actionText="create"
      />
      <h1 className={"mb-5 text-center text-3xl underline"}>My Classrooms</h1>
      <h2 className={"text-center text-2xl"}>Admin Classrooms</h2>
      {/* ADMIN CLASSES */}
      <div>
        <div className="flex flex-wrap justify-start gap-4">
          {adminClasses.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              isAdmin={true}
            />
          ))}
        </div>
      </div>
      <hr className="my-5 h-1 border-0 bg-gray-800 dark:bg-white" />
      <h2 className={"text-center text-2xl"}>Member Classrooms</h2>
      {/* NON-ADMIN CLASSES */}
      <div>
        <div className="flex flex-wrap justify-start gap-4">
          {memberClasses.map((classroom) => (
            <ClassroomCard
              key={classroom.id}
              classroom={classroom}
              isAdmin={false}
            />
          ))}
        </div>
      </div>
      <hr className="my-5 h-5 border-0 bg-gray-800 dark:bg-white" />
      <h1 className={"mb-5 text-center text-3xl underline"}>
        Archived Classrooms
      </h1>
      <h2 className={"text-center text-2xl"}>Admin Classrooms</h2>
      {/* {mapToListItemArchived(adminClasses, true)} */}

      <hr className="my-5 h-1 border-0 bg-gray-800 dark:bg-white" />
      <h2 className={"text-center text-2xl"}>Member Classrooms</h2>
      {/* NON-ADMIN CLASSES */}
      {/* {mapToListItemArchived(memberClasses, false)} */}
    </>
  );
}
