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
import {
  Edit,
  LogOut,
  MessageSquareMore,
  MessagesSquareIcon,
  UserPlus,
  Users,
  FileText,
} from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { cn } from "@/shared/lib/utils";

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
    const joinedClassSuccess = searchParams.get("joinSuccess");
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
      <Card className="flex w-auto min-w-fit flex-col" animated>
        <CardHeader className="flex flex-grow flex-col">
          <CardTitle animated className="flex flex-grow justify-between">
            {classroom.name}
            <InviteInfoDialog
              classroomName={classroom.name ?? "Classroom"}
              code={classroom.join_code?.toLocaleUpperCase() ?? ""}
            />
          </CardTitle>
          <CardDescription animated>
            <div className="flex flex-row gap-3">
              Created:{" "}
              {classroom.created_at ? (
                new Date(classroom.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              ) : (
                <Skeleton className="h-5 w-5/12 self-center" />
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-4 aspect-video rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500" />
        </CardContent>
        <CardFooter
          animated
          className="m-0 justify-between pb-1 pt-1 align-bottom"
        >
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
            <TooltipUtil
              trigger={
                <Button type="button" variant={"ghost"} size={"iconLg"} asChild>
                  <Link href={`/classrooms/${classroom.id}/chatrooms`} passHref>
                    <MessagesSquareIcon className="scale-[200%]" />
                  </Link>
                </Button>
              }
              content={"Chatrooms"}
            />

            {classroom.Classroom_Members &&
              classroom.Classroom_Members.length > 0 && (
                <MemberList
                  classroom={classroom}
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
                  newRowLoading={false}
                  userId={userId}
                />
              )}

            <TooltipUtil
              trigger={
                <Button type="button" variant={"ghost"} size={"iconLg"} asChild>
                  <Link href={`/classrooms/${classroom.id}/augment`} passHref>
                    <FileText className="scale-[200%]" />
                  </Link>
                </Button>
              }
              content={"Augment Notes"}
            />
          </div>
          {isAdmin ? (
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
          ) : (
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

  function ArchivedSections({
    archClassrooms,
    isAdmin,
  }: {
    archClassrooms: ClassroomWithMembers[];
    isAdmin: boolean;
  }) {
    console.log(archClassrooms);
    if (!archClassrooms || archClassrooms.length <= 0) {
      return;
    }
    return (
      <Accordion type="single" collapsible className="mt-10">
        <AccordionItem value="item-1">
          <AccordionTrigger
            className="justify-start gap-3 hover:no-underline"
            chevronClassName="scale-[2]"
          >
            <h1 className="text-2xl font-medium tracking-tight">
              Archived Classrooms
            </h1>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="my-2 space-y-2">
              {archClassrooms.map((cm) => (
                <li
                  key={cm.name}
                  className="flex w-full justify-between rounded-md border p-3 text-xl"
                >
                  <div>
                    {cm.name}
                    <p className="text-sm text-muted-foreground">
                      Created:{" "}
                      {new Date(cm.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {isAdmin && (
                    <Button
                      effect="expandIcon"
                      icon={Edit}
                      iconPlacement="right"
                    >
                      <Link href={`/classrooms/${cm.id}/manage`} passHref>
                        Manage
                      </Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <div className="p-4">
      {/* <h1 className={"mb-5 text-center text-3xl underline"}>My Classrooms</h1>
      <h2 className={"text-center text-2xl"}>Admin Classrooms</h2> */}
      {/* ADMIN CLASSES */}
      <h1 className="mb-10 text-3xl font-medium tracking-tight">Classrooms</h1>

      <Tabs
        value={currentTab}
        onValueChange={(value) => {
          window.history.replaceState(null, "", `/classrooms?tab=${value}`);
          setCurrentTab(value);
        }}
        defaultValue="enrolled"
        // className="w-[75vw] bg-"
      >
        <div className="flex flex-row justify-between gap-10 max-[650px]:flex-col">
          <TabsList className="flex w-full max-w-full flex-row items-center justify-start bg-inherit max-[340px]:flex-col">
            <TabsTrigger
              className={cn(
                "flex h-9 min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-7 text-center text-2xl font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:!bg-muted data-[active=true]:text-foreground",
                "relative !no-underline after:absolute after:bottom-1 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-left hover:after:scale-x-100"
              )}
              value="enrolled"
              data-active={currentTab === "enrolled"}
            >
              Enrolled
            </TabsTrigger>
            <TabsTrigger
              className={cn(
                "flex h-9 min-w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full px-7 text-center text-2xl font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:!bg-muted data-[active=true]:text-foreground",
                "relative !no-underline after:absolute after:bottom-1 after:h-[1px] after:w-2/3 after:origin-bottom-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-in-out hover:after:origin-bottom-left hover:after:scale-x-100"
              )}
              value="admin"
              data-active={currentTab === "admin"}
            >
              Admin
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-3 max-[650px]:flex-col">
            <JoinDialog />
            <SaveClassroomDialog
              optimisticUpdateCallback={addOptimistic}
              actionText="create"
              dialogTrigger={
                <DialogTrigger asChild className="">
                  <Button
                    variant="outline"
                    className="flex gap-2"
                    effect={"hoverUnderline"}
                  >
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
            <div className="grid auto-rows-min gap-4 min-[940px]:grid-cols-2 min-[1270px]:grid-cols-3 min-[1665px]:grid-cols-4">
              {adminClasses
                .filter((x) => !x.archived)
                .map((classroom) => (
                  <ClassroomCard
                    key={classroom.id}
                    classroom={classroom}
                    isAdmin={true}
                  />
                ))}
            </div>
          </div>
          <ArchivedSections
            archClassrooms={adminClasses.filter((x) => x.archived)}
            isAdmin
          />
        </TabsContent>
        <TabsContent value="enrolled">
          <div>
            <div className="grid auto-rows-min gap-4 min-[940px]:grid-cols-2 min-[1270px]:grid-cols-3 min-[1665px]:grid-cols-4">
              {memberClasses
                .filter((x) => !x.archived)
                .map((classroom) => (
                  <ClassroomCard
                    key={classroom.id}
                    classroom={classroom}
                    isAdmin={false}
                  />
                ))}
            </div>
          </div>
          <ArchivedSections
            archClassrooms={memberClasses.filter((x) => x.archived)}
            isAdmin={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
