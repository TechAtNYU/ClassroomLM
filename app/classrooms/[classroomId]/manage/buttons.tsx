// import { createClient } from "@/utils/supabase/server"; // notice how it uses the server one since we don't have "useclient" so the default is server side component
// "use client";

// import { getCurrentUserId, retrieveClassroomData } from "../../classroom/actions";
"use client";

import Link from "next/link";
// import MemberList from "../../classroom/memberList";
import {
  changeClassroomName,
  deleteClassroom,
  inviteMemberToClassroom,
  removeMember,
  setArchiveStatusClassroom,
} from "../../actions";
import { optimisticUpdateAndFetchClassroomData } from "../../clientUtils";
import {
  ClassroomWithMembers,
  getUserAndClassroomData,
  UserWithClassroomsData,
} from "@shared/lib/userContext/contextFetcher";
import { useRouter } from "next/navigation";
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
} from "@shared/components/ui/alert-dialog";
import { Dispatch, SetStateAction, useState, useTransition } from "react";
import { User } from "@supabase/supabase-js";
import SaveClassroomDialog from "../../_components/saveClassroomDialog";
import { Skeleton } from "@shared/components/ui/skeleton";
import MemberList from "../../_components/memberList";
import InviteMember from "./_components/inviteMember";
import {
  Archive,
  ArchiveRestore,
  Edit3,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { DialogTrigger } from "@/shared/components/ui/dialog";

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
  const [isPending, startTransition] = useTransition();
  const [newRowLoading, setNewRowLoading] = useState(false);
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

  const inviteMember = async (email: string) => {
    return await optimisticUpdateAndFetchClassroomData(
      async () => {
        setNewRowLoading(true);
        const result = await inviteMemberToClassroom(classroomData.id, email);
        return result;
      },
      {
        Classroom_Members: [...(classroomData.Classroom_Members ?? [])],
      },
      setUserAndClassCallback,
      classroomData.id,
      async () => {
        await refreshClassrooms();
        setNewRowLoading(false);
      }
    );
  };

  const removeMemberFunction = async (memberId: string) => {
    return await optimisticUpdateAndFetchClassroomData(
      async () => removeMember(classroomData.id, memberId),
      "memberRemove",
      setUserAndClassCallback,
      classroomData.id,
      refreshClassrooms,
      memberId
    );
  };

  const deleteClassroomFunction = async () => {
    router.push(`/classrooms?tab=admin`);
    startTransition(async () => {
      await deleteClassroom(classroomData.id);
    });
    toast.success(`Successfully deleted classroom ${classroomData.name}`);
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

    refreshClassrooms();
  };

  const archiveClassroomCallback = async () => {
    // optimisticUpdateAndFetchClassroomData(
    //   classroomId,
    //   async () => setArchiveStatusClassroom(classroomId, true),
    //   { archived: true },
    //   setUserAndClassData,
    //   refreshClassrooms
    // );
    const action = classroomData.archived ? "unarchive" : "archive";
    const result = await setArchiveStatusClassroom(
      classroomData.id,
      !classroomData.archived
    );
    if (result.success) {
      toast.success(`Successfully ${action}d classroom ${classroomData.name}`);
      router.push(`/classrooms?tab=admin`);
      refreshClassrooms();
    } else {
      toast.error(`Couldn't ${action} classroom, refresh and try again`);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            className="flex w-fit items-center gap-2 px-4 py-2"
            effect={"hoverUnderlineInvert"}
            asChild
          >
            <Link href="upload" passHref className="flex items-center gap-2">
              <Upload /> Upload materials
            </Link>
          </Button>
          <InviteMember optimisticUpdateCallback={inviteMember} />
          <SaveClassroomDialog
            optimisticUpdateCallback={handleChangeClassroomName}
            actionText="update"
            dialogTrigger={
              <DialogTrigger asChild className="">
                <Button
                  variant="outline"
                  className="flex gap-2"
                  effect={"hoverUnderline"}
                >
                  <Edit3 /> Update info
                </Button>
              </DialogTrigger>
            }
          />
        </div>

        <div className="flex items-center justify-end gap-4">
          <Button
            variant={
              classroomData.archived ? "successGhost" : "destructiveGhost"
            }
            className="flex gap-2"
            effect={"hoverUnderline"}
            onClick={() => archiveClassroomCallback()}
          >
            {classroomData.archived ? (
              <>
                <ArchiveRestore /> {"Unarchive"}
              </>
            ) : (
              <>
                <Archive /> {"Archive"}
              </>
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="flex gap-2"
                effect={"hoverUnderlineInvert"}
              >
                <Trash2 /> Delete
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this classroom.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={() => deleteClassroomFunction()}
                >
                  {isPending && <Loader2 className="animate-spin" />} Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {/* <p>Invite Member:</p> */}

      {classroomData.Classroom_Members &&
      classroomData.Classroom_Members.length > 0 ? (
        <MemberList
          classroom={classroomData}
          userId={userData.id}
          optimisticRemoveCallback={removeMemberFunction}
          newRowLoading={newRowLoading}
        />
      ) : (
        <Skeleton></Skeleton>
      )}
    </div>
  );
}
