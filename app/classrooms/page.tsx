"use client";
import { useContext, useEffect, useState } from "react";
import { leaveClassroom, newClassroom } from "./actions";
import Link from "next/link";
import MemberList from "./_components/memberList";
import {
  ClassroomWithMembers,
  getUserAndClassroomData,
} from "@shared/lib/userContext/contextFetcher";
import {
  UserContext,
  UserContextType,
} from "@shared/lib/userContext/userContext";
import { Skeleton } from "@shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import {
  optimisticUpdateAndFetchClassroomData,
  TooltipUtil,
} from "./clientUtils";

import { useSearchParams } from "next/navigation";
import { Edit, LogOut, MessageSquareMore, UserPlus, Users } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import SaveClassroomDialog from "./_components/saveClassroomDialog";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/shared/components/ui/tabs";
import { Separator } from "@/shared/components/ui/separator";
import InviteInfoDialog from "./_components/invite-dialog";
import JoinDialog from "./_components/join-dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

export default function ClassroomPage() {
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

  return <ClassroomList userContext={userContext} />;
}

function ClassroomList({ userContext }: { userContext: UserContextType }) {
  const searchParams = useSearchParams();
  const [currentTab, setCurrentTab] = useState("enrolled");

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
    const tab = searchParams.get("tab");
    if (tab && (tab == "enrolled" || tab == "admin")) {
      setCurrentTab(tab);
    } else {
      setCurrentTab("enrolled");
    }
  }, [searchParams]);

  useEffect(() => {
    const joinedClassSuccess = searchParams.get("join_success");
    console.log(joinedClassSuccess);
    if (joinedClassSuccess && !isNaN(Number(joinedClassSuccess))) {
      const joinClassInfo = userAndClassData.classroomsData.find(
        (x) => x.id === Number(joinedClassSuccess)
      );
      if (!joinClassInfo) {
        refreshClassrooms();
        return;
      }
      if (joinClassInfo) {
        // Join class doesn't need to refresh classroom data since we know its fresh
        // since it's coming from a redirect from a reoute
        // router.replace("/classroom", { scroll: false });
        // https://nextjs.org/blog/next-14-1#windowhistorypushstate-and-windowhistoryreplacestate

        if (typeof window !== "undefined") {
          console.log("replacing and ", window.history.state, [
            ...searchParams.entries(),
          ]);
          window.history.replaceState(null, "", "/classrooms");

          toast.success(
            <div>
              Successfully joined classroom
              <span className="font-bold"> {joinClassInfo.name}</span>!
            </div>,
            { duration: 10000 }
          );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, userAndClassData.classroomsData]);

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
      <Card className="w-auto min-w-fit" animated>
        <CardHeader>
          <CardTitle animated className="flex justify-between">
            {classroom.name}
            <InviteInfoDialog
              classroomName={classroom.name ?? "Classroom"}
              code={classroom.join_code ?? ""}
            />
          </CardTitle>
          <CardDescription animated>
            <div className="flex flex-row gap-3">
              Join Code:{" "}
              {classroom.join_code || (
                <Skeleton className="h-5 w-5/12 self-center" />
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-5 aspect-video rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500" />
        </CardContent>
        <CardFooter animated className="m-0 justify-between pb-1 align-bottom">
          <div className="">
            <TooltipUtil
              trigger={
                <Button type="button" variant={"ghost"} size={"iconLg"} asChild>
                  <Link href={`/classrooms/${classroom.id}/chat`} passHref>
                    <MessageSquareMore className="scale-[200%]" />
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
                    <Link href={`/classrooms/${classroom.id}/manage`} passHref>
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
          </div>
          {!isAdmin && (
            <TooltipUtil
              trigger={
                <Button
                  type="button"
                  variant={"destructiveGhost"}
                  size={"iconLg"}
                  onClick={() => leaveOptimistic(classroom.id)}
                  className="ml-auto"
                >
                  <LogOut className="scale-[200%]" />
                </Button>
              }
              content={"Leave Classroom"}
            />
          )}
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="p-4">
      {/* <h1 className={"mb-5 text-center text-3xl underline"}>My Classrooms</h1>
      <h2 className={"text-center text-2xl"}>Admin Classrooms</h2> */}
      {/* ADMIN CLASSES */}
      <h1 className="mb-10 text-5xl font-medium tracking-tight">Classrooms</h1>

      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          window.history.replaceState(null, "", `/classrooms?tab=${value}`);
          setCurrentTab(value);
        }}
        defaultValue="enrolled"
        // className="w-[75vw] bg-"
      >
        <div className="flex justify-between">
          <TabsList className="grid w-[20vw] grid-cols-2 rounded-full bg-inherit">
            <TabsTrigger
              className="flex h-9 min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-center text-2xl font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:!bg-muted data-[active=true]:text-foreground"
              value="enrolled"
              data-active={currentTab === "enrolled"}
            >
              Enrolled
            </TabsTrigger>
            <TabsTrigger
              className="flex h-9 min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-center text-2xl font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:!bg-muted data-[active=true]:text-foreground"
              value="admin"
              data-active={currentTab === "admin"}
            >
              Admin
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-3">
            <JoinDialog />
            <SaveClassroomDialog
              optimisticUpdateCallback={addOptimistic}
              actionText="create"
              dialogTrigger={
                <DialogTrigger asChild className="">
                  <Button variant="outline" className="flex gap-2">
                    <UserPlus /> Create Classroom
                  </Button>
                </DialogTrigger>
              }
            />
          </div>
        </div>
        <Separator className="my-4 mb-10" />
        <TabsContent value="admin">
          <div>
            <div className="grid auto-rows-min gap-4 min-[880px]:grid-cols-2 min-[1125px]:grid-cols-3 min-[1665px]:grid-cols-5">
              {adminClasses.map((classroom) => (
                <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  isAdmin={true}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="enrolled">
          {/* <h2 className={"text-center text-2xl"}>Member Classrooms</h2> */}
          {/* NON-ADMIN CLASSES */}
          <div>
            <div className="grid auto-rows-min gap-4 min-[880px]:grid-cols-2 min-[1125px]:grid-cols-3 min-[1665px]:grid-cols-5">
              {memberClasses.map((classroom) => (
                <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  isAdmin={false}
                />
              ))}
            </div>
          </div>
        </TabsContent>
        {/* <hr className="my-5 h-5 border-0 bg-gray-800 dark:bg-white" />
        <h1 className={"mb-5 text-center text-3xl underline"}>
          Archived Classrooms
        </h1> */}
        {/* <h2 className={"text-center text-2xl"}>Admin Classrooms</h2> */}
        {/* {mapToListItemArchived(adminClasses, true)} */}

        {/* <hr className="my-5 h-1 border-0 bg-gray-800 dark:bg-white" /> */}
        {/* <h2 className={"text-center text-2xl"}>Member Classrooms</h2> */}
        {/* NON-ADMIN CLASSES */}
        {/* {mapToListItemArchived(memberClasses, false)} */}
      </Tabs>
    </div>
  );
}
