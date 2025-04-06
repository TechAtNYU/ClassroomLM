// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";
"use client";

import InviteMember from "./inviteMember";
import Link from "next/link";
// import MemberList from "../../classroom/memberList";
import {
  changeClassroomName,
  deleteClassroom,
  setArchiveStatusClassroom,
} from "../../actions";
import { optimisticUpdateAndFetchClassroomData } from "../../clientUtils";
import { getUserAndClassroomData } from "@/app/lib/userContext/contextFetcher";
import { UserContextType } from "@/app/lib/userContext/userContext";
import { Skeleton } from "@/components/ui/skeleton";
import MemberList from "../../memberList";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useState } from "react";

export default function ClassroomManagementButtons({
  classroomId,
  userContext,
}: {
  classroomId: number;
  userContext: UserContextType;
}) {
  //   const userId = await getCurrentUserId();
  //   const classData = await retrieveClassroomData(userId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const classroomIdNumber = Number(classroomId);
  const { setUserAndClassData, userAndClassData } = userContext;
  const router = useRouter();
  // const searchParams = useSearchParams();

  const classroomInfo = userAndClassData.classroomsData.find(
    (x) => x.id === classroomId
  );

  const [newClassName, setNewClassName] = useState<string>(
    classroomInfo?.name ?? ""
  );

  if (!classroomInfo) {
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

  // const handleChangeClassroomName = async (classroomId: number) => {
  //   // const newName = window.prompt("Enter new class name:");
  //   // if (newName !== null && newName !== "") {
  //   //   optimisticUpdateAndFetchClassroomData(
  //   //     classroomId,
  //   //     async () => changeClassroomName(classroomId, newName),
  //   //     { name: newName },
  //   //     setUserAndClassData,
  //   //     refreshClassrooms
  //   //   );
  //   // }

  //   optimisticUpdateAndFetchClassroomData(
  //     classroomId,
  //     async () => changeClassroomName(classroomId, newName),
  //     { name: newName },
  //     setUserAndClassData,
  //     refreshClassrooms
  //   );
  // };

  const handleChangeClassroomName = async (classroomId: number) => {
    if (newClassName.trim() !== "") {
      optimisticUpdateAndFetchClassroomData(
        classroomId,
        async () => changeClassroomName(classroomId, newClassName),
        { name: newClassName },
        setUserAndClassData,
        refreshClassrooms
      );
    }
    setIsDialogOpen(false);
  };

  const refreshClassrooms = async () => {
    const refreshedData = await getUserAndClassroomData();
    if (refreshedData) {
      setUserAndClassData(refreshedData);
    }
  };

  const deleteClassroomFunction = async (classroomId: number) => {
    // const confirmation = window.confirm(
    //   "Are you sure? This action can't be undone."
    // );
    // if (confirmation) {

    const delete_success = new URL("/classroom");
    delete_success.searchParams.append(
      "delete_success",
      classroomId.toString()
    );
    // router.push(/classroom?delete_success=${classroomId.toString()})
    // router.replace(delete_success.toString());

    router.replace("/classroom");

    optimisticUpdateAndFetchClassroomData(
      classroomId,
      async () => deleteClassroom(classroomId),
      "remove",
      setUserAndClassData
    );
    toast({
      title: "Successfully deleted classroom.",
    });

    // Redirect to the classrooms page after deletion
    // } else {
    //   console.log("Classroom deletion cancelled."); //TODO: remove log message
    // }
  };

  return (
    <div>
      {"Look at the class info: " + classroomInfo.name}
      <Link href={`upload`} passHref>
        <button
          type="button"
          className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
        >
          Upload Materials
        </button>
      </Link>
      {/* ARCHIVE BUTTON */}
      <button
        type="button"
        className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
        onClick={() =>
          optimisticUpdateAndFetchClassroomData(
            classroomId,
            async () => setArchiveStatusClassroom(classroomId, true),
            { archived: true },
            setUserAndClassData,
            refreshClassrooms
          )
        }
      >
        Archive
      </button>

      {/* <button
        type="button"
        className="me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
        onClick={() => deleteClassroomFunction(classroomIdNumber)}
      >
        Delete
      </button> */}

      <AlertDialog>
        <AlertDialogTrigger>Delete</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              classroom.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteClassroomFunction(classroomIdNumber)}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CHANGE NAME BUTTON */}
      {/* <button
        onClick={() => handleChangeClassroomName(classroomIdNumber)}
        type="button"
        className="me-2 rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
      >
        Change Name
      </button> */}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Change Classroom Name</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Classroom</DialogTitle>
            <DialogDescription>
              Make changes to the name of your classroom here.
            </DialogDescription>
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
            <Button
              type="button"
              onClick={() => handleChangeClassroomName(classroomIdNumber)}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {classroomInfo.Classroom_Members &&
        classroomInfo.Classroom_Members.length > 0 && (
          <MemberList classroom={classroomInfo} enableDeletion={true} />
        )}
      <p>Invite Member:</p>
      <InviteMember classroomId={classroomId} />
    </div>
  );
}
