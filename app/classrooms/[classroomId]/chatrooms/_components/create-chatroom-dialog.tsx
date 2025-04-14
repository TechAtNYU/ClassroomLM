"use client";

import { createChatroom } from "@/app/chatrooms/actions";
import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@shared/components/ui/dialog";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

function CreateButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating..." : "Create"}
    </Button>
  );
}

export function CreateChatroomDialog({ classroomId }: { classroomId: string }) {
  const [open, setOpen] = useState(false);

  const handleCreateChatroom = async (formData: FormData) => {
    await createChatroom(formData);
    setOpen(false); // Close the dialog after submission
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[350px]">
        <DialogHeader>
          <DialogTitle>New Chatroom</DialogTitle>
          <DialogDescription>
            Create a new Chatroom for current classroom.
          </DialogDescription>
        </DialogHeader>
        <form action={handleCreateChatroom} className="flex gap-2">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="chatroom-name" className="text-right">
                Name
              </Label>
              <Input
                id="chatroom-name"
                name="name"
                defaultValue="New Chatroom"
                className="col-span-3"
                required
              />
            </div>
            <input
              type="text"
              name="classroom_id"
              defaultValue={classroomId}
              readOnly
              hidden
              required
            />
            <DialogFooter>
              <CreateButton />
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
