// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";
"use client";

import Link from "next/link";
// import MemberList from "../../classroom/memberList";
import {
  changeClassroomName,
  deleteClassroom,
  setArchiveStatusClassroom,
} from "../../actions";
import { optimisticUpdateAndFetchClassroomData } from "../../clientUtils";
import {
  ClassroomWithMembers,
  getUserAndClassroomData,
  UserWithClassroomsData,
} from "@/app/lib/userContext/contextFetcher";
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
import { Dispatch, SetStateAction } from "react";
import { User } from "@supabase/supabase-js";
import SaveClassroomDialog from "../../_components/saveClassroomDialog";
import { Skeleton } from "@/components/ui/skeleton";
import MemberList from "../../memberList";
import InviteMember from "./_components/inviteMember";

export default function ClassroomManagementButtons({
  userData,
  classroomData,
  setUserAndClassCallback,
}: {
  userData: User;
  classroomData: ClassroomWithMembers;
  setUserAndClassCallback: Dispatch<SetStateAction<UserWithClassroomsData>>;
}) {
  const router = useRouter();
  // const searchParams = useSearchParams();

  // const [newClassName, setNewClassName] = useState<string>(
  //   classroomInfo?.name ?? ""
  // );

  // if (!classroomInfo) {
  //   return (
  //     <div className="flex items-center space-x-4">
  //       <Skeleton className="h-12 w-12 rounded-full" />
  //       <div className="space-y-2">
  //         <Skeleton className="h-4 w-[250px]" />
  //         <Skeleton className="h-4 w-[200px]" />
  //       </div>
  //     </div>
  //   );
  // }

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
  const refreshClassrooms = async () => {
    const refreshedData = await getUserAndClassroomData();
    if (refreshedData) {
      setUserAndClassCallback(refreshedData);
    }
  };

  const handleChangeClassroomName = async (newName: string) => {
    return await optimisticUpdateAndFetchClassroomData(
      async () => changeClassroomName(classroomData.id, newName),
      { name: newName },
      setUserAndClassCallback,
      classroomData.id,
      refreshClassrooms
    );
  };

  const deleteClassroomFunction = async () => {
    await deleteClassroom(classroomData.id);
    // const confirmation = window.confirm(
    //   "Are you sure? This action can't be undone."
    // );
    // if (confirmation) {

    // const delete_success = new URL("/classroom");
    // delete_success.searchParams.append(
    //   "delete_success",
    //   classroomId.toString()
    // );
    // redirect(delete_success)

    router.push(`/classroom?delete_success=${classroomData.id.toString()}`);
  };

  const archiveClassroomCallback = async () => {
    // optimisticUpdateAndFetchClassroomData(
    //   classroomId,
    //   async () => setArchiveStatusClassroom(classroomId, true),
    //   { archived: true },
    //   setUserAndClassData,
    //   refreshClassrooms
    // );
    setArchiveStatusClassroom(classroomData.id, true);
    toast({
      title: "Successfully archived classroom.",
    });
    router.push(`/classroom?archive_success=${classroomData.id.toString()}`);
    refreshClassrooms();
  };

  return (
    <div>
      {"Look at the class info: " + classroomData.name}
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
        onClick={() => archiveClassroomCallback()}
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
            <AlertDialogAction onClick={() => deleteClassroomFunction()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SaveClassroomDialog
        // isDialogOpen={isDialogOpen}
        // setIsDialogOpen={setIsDialogOpen}
        optimisticUpdateCallback={handleChangeClassroomName}
        actionText="update"
      />

      {classroomData.Classroom_Members &&
      classroomData.Classroom_Members.length > 0 ? (
        <MemberList
          classroom={classroomData}
          enableDeletion={true}
          userId={userData.id}
        />
      ) : (
        <Skeleton></Skeleton>
      )}
      <p>Invite Member:</p>
      <InviteMember classroomId={classroomData.id} />
    </div>
  );
}
