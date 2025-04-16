"use client";
import { useState } from "react";
import { inviteMemberToClassroom } from "../../../actions";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { TooltipUtil } from "@/app/classrooms/clientUtils";

export default function InviteMember({ classroomId }: { classroomId: number }) {
  const [email, setEmail] = useState("");
  const handleInvite = async () => {
    try {
      await inviteMemberToClassroom(email, classroomId);
      setEmail("");
      toast.success("Added Member Successfully", {
        description: `${email} was added to the class.`,
      });
    } catch (error: unknown) {
      //type unknown for typescript lint
      if (error instanceof Error) {
        toast.error("The user is already part of the classroom.");
        // console.error(error.message);
      } else {
        console.error("Error Occured");
      }
    }
  };

  return (
    <div className="my-3 flex gap-5">
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={
          "block w-5/12 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
        }
      />

      <TooltipUtil
        trigger={
          <Button
            type="button"
            variant={"ghost"}
            size={"iconLg"}
            asChild
            onClick={handleInvite}
            // className="me-2 rounded-lg border px-5 py-2.5 text-center text-sm font-medium hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
          >
            <UserPlus className="scale-[50%]" />
          </Button>
        }
        content={"Invite Member"}
      />
      {/* <button
        onClick={handleInvite}
        className="flex w-full items-center justify-center rounded-lg bg-blue-700 px-2.5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
      >
        <Plus />
        <User />
      </button> */}
    </div>
  );
}
