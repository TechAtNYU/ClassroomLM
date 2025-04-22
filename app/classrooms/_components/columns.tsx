"use client";

import { Tables } from "@shared/utils/supabase/database.types";
import { ColumnDef } from "@tanstack/react-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@shared/components/ui/avatar";
import { Skeleton } from "@/shared/components/ui/skeleton";

export const columns: ColumnDef<Tables<"Users">>[] = [
  {
    accessorKey: "avatar_url",
    header: () => <div className="m-1">User</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-bold">
        <div>
          {row.renderValue("avatar_url") === "loading" ? (
            <Skeleton className="size-6 rounded-md" />
          ) : (
            <Avatar className="size-5">
              <AvatarImage
                src={row.renderValue("avatar_url")}
                referrerPolicy="no-referrer"
              />
              <AvatarFallback>{row.original.full_name} Avatar</AvatarFallback>
            </Avatar>
          )}
        </div>
        {row.original.full_name}
      </div>
    ),
  },
  {
    accessorKey: "id",
    header: "User ID",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
];
