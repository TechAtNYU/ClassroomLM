"use client";

import { Check, Plus } from "lucide-react";

import { Button } from "@shared/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { useEffect, useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { createClient } from "@/shared/utils/supabase/client";
import { toast } from "sonner";
import { inviteUserToChatroom } from "../../actions";

interface ChatroomMembers {
  chatroom_id: string;
  created_at: string;
  id: number;
  is_active: boolean;
  member_id: number;
  Classroom_Members: {
    id: number;
    user_id: string;
    classroom_id: number;
    Users: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
}

interface ClassroomMember {
  id: number;
  user_id: string;
  classroom_id: number;
  Users: {
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function InviteChatroomButton({
  chatroomId,
  classroomId,
  chatroomMembers,
}: {
  chatroomId: string;
  classroomId: number;
  chatroomMembers: ChatroomMembers[];
}) {
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<ClassroomMember[]>([]);
  const [classroomInvitees, setClassroomInvitees] = useState<ClassroomMember[]>(
    []
  );

  // get a list of Classroom_Members id
  const currentMemberIds = chatroomMembers.map(
    (member) => member.Classroom_Members.id
  );

  useEffect(() => {
    async function fetchClassroomMembers() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("Classroom_Members")
        .select(
          `
          id,
          user_id,
          classroom_id,
          Users (
            email,
            full_name,
            avatar_url
          )
          `
        )
        .eq("classroom_id", classroomId);

      if (error) {
        console.error("Error fetching classroom members:", error);
      } else {
        setClassroomInvitees(data as ClassroomMember[]);
      }
    }

    if (open) {
      fetchClassroomMembers();
    }
  }, [classroomId, currentMemberIds, open]);

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      const invitePromises = selectedUsers.map((invitee) =>
        inviteUserToChatroom(chatroomId, invitee.Users.email || "")
      );

      await Promise.all(invitePromises);

      setOpen(false);
      setSelectedUsers([]);
      toast.success("Successfully invited user(s) to chatroom");
    } catch (error) {
      console.error("Error inviting users:", error);
      toast.error("Error inviting user(s)");
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus />
        Invite
      </Button>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSelectedUsers([]);
          }
        }}
      >
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pb-4 pt-5">
            <DialogTitle>New chatroom Member</DialogTitle>
            <DialogDescription>
              Invite a user to this chatroom. You can only invite members of
              current classroom.
            </DialogDescription>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
            <CommandInput placeholder="Search member..." />
            <CommandList>
              <CommandEmpty>No members found.</CommandEmpty>
              <CommandGroup className="p-2">
                {classroomInvitees.map((user) => (
                  <CommandItem
                    key={user.id.toString()}
                    className="flex items-center px-2"
                    onSelect={() => {
                      if (
                        selectedUsers.some(
                          (selected) => selected.id === user.id
                        )
                      ) {
                        setSelectedUsers(
                          selectedUsers.filter(
                            (selectedUser) => selectedUser.id !== user.id
                          )
                        );
                      } else {
                        setSelectedUsers([...selectedUsers, user]);
                      }
                    }}
                  >
                    <Avatar>
                      <AvatarImage
                        src={user.Users.avatar_url || ""}
                        alt="Image"
                      />
                      <AvatarFallback>
                        {user.Users.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-2">
                      <p className="text-sm font-medium leading-none">
                        {user.Users.full_name || "Unknown"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.Users.email || "No email"}
                      </p>
                    </div>
                    {selectedUsers.some(
                      (selected) => selected.id === user.id
                    ) ? (
                      <Check className="ml-auto flex h-5 w-5 text-primary" />
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
            {selectedUsers.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden">
                {selectedUsers.map((user) => (
                  <Avatar
                    key={user.Users.email}
                    className="inline-block border-2 border-background"
                  >
                    <AvatarImage src={user.Users.avatar_url!} />
                    <AvatarFallback>{user.Users.full_name![0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select users to add to this thread.
              </p>
            )}
            <Button
              disabled={selectedUsers.length <= 0}
              onClick={handleInviteUsers}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InviteChatroomButton;
