"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ClassroomWithMembers } from "./actions";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";

export default function MemberList({
  classroom,
}: {
  classroom: ClassroomWithMembers;
}) {
  if (!classroom.Classroom_Members) {
    return <h1>No members found!</h1>;
  }
  // other table implementation: https://data-table.openstatus.dev/
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button>Show Members</button>
      </SheetTrigger>
      <SheetContent className="w-[900px] sm:max-w-5xl">
        {/* for some reason chanding the width doesn't actually do anything */}
        <SheetHeader>
          <SheetTitle>{classroom.name} Members</SheetTitle>
          {/* <SheetDescription>
      Make changes to your profile here. Click save when
      you're done.
    </SheetDescription> */}
          {/* <h3>Members:</h3> */}
          {/* <ul>
            {classroom.Classroom_Members.map((member) => (
              <li key={member.id}>
                <div className="flex gap-2">
                  <Avatar>
                    <AvatarImage asChild src={member.Users.avatar_url}>
                                <Image
                                    src={member.Users.avatar_url}
                                    fill={true}
                                    alt="Member avatar"
                                  />
                    </AvatarImage>
                    <AvatarFallback>
                      {member.Users.full_name} Avatar
                    </AvatarFallback>
                  </Avatar>
                  {member.Users.full_name} | User ID: {member.Users.id}
                </div>{" "}
              </li>
            ))}
          </ul> */}
          <DataTable
            columns={columns}
            data={classroom.Classroom_Members.map((x) => x.Users)}
          />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
