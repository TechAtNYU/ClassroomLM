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

export default function MemberList({
  classroom,
  enableDeletion,
}: {
  classroom: ClassroomWithMembers;
  enableDeletion: boolean;
}) {
  if (!classroom.Classroom_Members) {
    return <h1>No members found!</h1>;
  }

  const handleDelete = (memberId:any) => {
    console.log("ID:" + memberId);
  }

  

  // other table implementation: https://data-table.openstatus.dev/
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button>Show Members</button>
      </SheetTrigger>
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
