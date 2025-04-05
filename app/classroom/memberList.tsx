"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ClassroomWithMembers } from "../lib/userContext/contextFetcher";
import { Users } from "lucide-react";
import { ReactNode } from "react";

/**
 *
 * @param triggerButton make sure you wrap with a SheetTrigger with an asChild in order for the sheet to work
 * @returns
 */
export default function MemberList({
  classroom,
  enableDeletion,
  triggerButton,
}: {
  classroom: ClassroomWithMembers;
  enableDeletion: boolean;
  triggerButton?: ReactNode;
}) {
  if (!classroom.Classroom_Members) {
    return <h1>No members found!</h1>;
  }

  const handleDelete = (memberId: string) => {
    console.log("ID:" + memberId);
  };

  // other table implementation: https://data-table.openstatus.dev/
  return (
    <Sheet>
      {triggerButton ? (
        triggerButton
      ) : (
        <SheetTrigger asChild>
          <button
            type="button"
            className="me-2 flex items-center rounded-lg border border-green-700 px-5 py-2.5 text-center text-sm font-medium text-green-700 hover:bg-green-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-green-300 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-600 dark:hover:text-white dark:focus:ring-green-900"
          >
            Manage Members
            <Users className="ml-2" />
          </button>
        </SheetTrigger>
      )}

      {/* not used: https://github.com/shadcn-ui/ui/issues/16#issuecomment-1602565563 */}
      <SheetContent className="flex w-[55vw] items-center justify-center align-middle sm:max-w-5xl">
        <SheetHeader>
          <SheetTitle>{classroom.name} Members</SheetTitle>
          {/* <SheetDescription>
      Make changes to your profile here. Click save when
      you're done.
    </SheetDescription> */}

          {/* todo future, for smaller screens, make the width even smaller */}
          <div className="w-[50vw]">
            <DataTable
              columns={[
                ...columns,
                ...(enableDeletion
                  ? [
                      {
                        id: "actions",
                        header: "Manage",
                        cell: ({ row }) => (
                          <button onClick={() => handleDelete("123")}>
                            Delete
                          </button>
                        ),
                      },
                    ]
                  : []),
              ]}
              data={classroom.Classroom_Members.map((x) => x.Users)}
            />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
