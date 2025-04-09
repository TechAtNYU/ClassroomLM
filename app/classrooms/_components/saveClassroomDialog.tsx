"use client";

import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ReactNode, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SaveClassroomDialog({
  optimisticUpdateCallback,
  actionText,
  dialogTrigger,
}: {
  optimisticUpdateCallback: (name: string) => Promise<unknown>;
  actionText: string;
  dialogTrigger?: ReactNode;
}) {
  const [newClassName, setNewClassName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const saveClassroomCallback = async () => {
    setIsDialogOpen(false);
    setIsPending(true);
    // startTransition(async () => {
    const result = await optimisticUpdateCallback(newClassName);
    if (!result) {
      toast.error(
        `Uh oh! Something went wrong when attempting to ${actionText.toLocaleLowerCase()} the classroom.`,
        {
          description: `Please refresh and try again`,
        }
      );
      return;
    }
    toast.success(`${capitalize(actionText)}d classroom successfully!`);
    setIsDialogOpen(false);
    setIsPending(false);
    setNewClassName("");
    // });
    return;
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {dialogTrigger ?? (
        <DialogTrigger asChild className="fixed bottom-6 right-6 z-50">
          <Button variant="outline">
            {capitalize(actionText)} a Classroom
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{capitalize(actionText)} a Classroom</DialogTitle>
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
            disabled={isPending}
            onClick={saveClassroomCallback}
          >
            {isPending && <Loader2 className="animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
