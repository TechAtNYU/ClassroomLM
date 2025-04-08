"use client";
import { useContext, useEffect, useState } from "react";
import {
  deleteClassroom,
  getCurrentUserId,
  leaveClassroom,
  newClassroom,
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

import {
  Dialog,
  DialogContent,
  // DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Edit, LogOut, MessageSquareMore, Trash2, Users } from "lucide-react";
import { SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";

export default function ClassroomList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");

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
  
  const joinedClassSuccess = searchParams.get("join_success");
  if (joinedClassSuccess && !isNaN(Number(joinedClassSuccess))) {
    const joinClassInfo = userAndClassData.classroomsData.find(
      (x) => x.id === Number(joinedClassSuccess)
    );
    if (joinClassInfo) {
      // Join class doesn't need to refresh classroom data since we know its fresh 
      // since it's coming from a redirect from a reoute
      toast({
        description: (
          <div>
            Successfully joined classroom
            <span className="font-bold"> {joinClassInfo.name}</span>!
          </div>
        ),
        duration: 10000,
      });
      router.replace("/classroom", {scroll: false})
    }
  }

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

  function mapToListItem(
    classroomList: ClassroomWithMembers[],
    isAdmin: boolean
  ) {
    return (
      <div>
        <div className="flex flex-wrap justify-start gap-4">
          {classroomList.map((classroom) => {
            return (
              <div key={classroom.id}>
                {!classroom.archived && (
                  <Card className="w-[450px]" animated>
                    <CardHeader>
                      <CardTitle>{classroom.name}</CardTitle>
                      <CardDescription>
                        Join Code: {classroom.join_code || "N/A"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <TooltipProvider>
                        <Tooltip delayDuration={300}>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent>Chat!</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {isAdmin && (
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant={"ghost"}
                                size={"iconLg"}
                                asChild
                                // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                              >
                                <Link
                                  href={`/classroom/${classroom.id}/manage`}
                                  passHref
                                >
                                  <Edit className="scale-[200%]" />
                                </Link>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Manage Classroom</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {classroom.Classroom_Members &&
                        classroom.Classroom_Members.length > 0 && (
                          <MemberList
                            classroom={classroom}
                            enableDeletion={false}
                            triggerButton={
                              <TooltipProvider>
                                <Tooltip delayDuration={300}>
                                  <SheetTrigger asChild>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant={"ghost"}
                                        size={"iconLg"}
                                        // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                                      >
                                        <Users className="scale-[200%]" />
                                      </Button>
                                    </TooltipTrigger>
                                  </SheetTrigger>
                                  <TooltipContent>View Members</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            }
                            userId={userId}
                          />
                        )}
                      {!isAdmin && (
                        <TooltipProvider>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant={"destructiveGhost"}
                                size={"iconLg"}
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
                                // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                              >
                                <LogOut className="scale-[200%]" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Leave Classroom</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
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
              <Card className="w-[450px]" animated>
                <CardHeader>
                  <CardTitle>{classroom.name}</CardTitle>
                  {/* <CardDescription>
                        Join Code: {classroom.join_code || "N/A"}
                      </CardDescription> */}
                </CardHeader>
                <CardContent>
                  {classroom.Classroom_Members &&
                    classroom.Classroom_Members.length > 0 && (
                      <MemberList
                        classroom={classroom}
                        enableDeletion={false}
                        triggerButton={
                          <TooltipProvider>
                            <Tooltip delayDuration={300}>
                              <SheetTrigger asChild>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant={"ghost"}
                                    size={"iconLg"}
                                    // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                                  >
                                    <Users className="scale-[200%]" />
                                  </Button>
                                </TooltipTrigger>
                              </SheetTrigger>
                              <TooltipContent>View Members</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        }
                      />
                    )}
                  <Button
                    type="button"
                    variant={"ghost"}
                    size={"iconLg"}
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
                    // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
                  >
                    <Trash2 className="scale-[200%]" />
                    {isAdmin ? "Delete Classroom" : "Remove Classroom"}
                  </Button>

                  {isAdmin && (
                    <Button
                      type="button"
                      variant={"ghost"}
                      size={"iconLg"}
                      // className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
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
                    </Button>
                  )}
                </CardContent>{" "}
              </Card>
              {/* <h2>Classroom ID: {classroom.id}</h2>
              <p>
                Ragflow Dataset ID: {classroom.ragflow_dataset_id || "null"}
              </p> */}

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

  const addClassroom = async (classId: number) => {
    if (newClassName.length != 0) {
      try {
        const result = await optimisticUpdateAndFetchClassroomData(
          classId,
          async () => newClassroom(newClassName, userId),
          { archived: true },
          setUserAndClassData,
          refreshClassrooms
        );
        if (!result) {
          // setResultText(`Error while making classroom!`);
          return;
        }
        toast({
          variant: "success",
          title: "Added classroom successfully!",
        });
        // setResultText(`Created classroom ${className} successfully!`);
      } catch (error: unknown) {
        //type unknown for typescript lint
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Error Occured");
        }
      }
      setIsDialogOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Can't create classrooms with an empty name.",
      });
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Create a Classroom</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a Classroom</DialogTitle>
            {/* <DialogDescription>
              Make changes to the name of your classroom here.
            </DialogDescription> */}
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input
                id="name"
                value={newClassName}
                className="col-span-3"
                onChange={(e) => setNewClassName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => addClassroom()}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
