"use client";
import { ReactNode, useState } from "react";
import { InviteActionResults } from "../../../actions";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
// import { TooltipUtil } from "@/app/classrooms/clientUtils";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

export default function InviteMember({
  optimisticUpdateCallback,
  dialogTrigger,
}: {
  optimisticUpdateCallback: (email: string) => Promise<unknown>;
  dialogTrigger?: ReactNode;
}) {
  const [email, setEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const inviteCallback = async () => {
    setIsDialogOpen(false);
    setIsPending(true);
    // startTransition(async () => {
    const result: InviteActionResults = (await optimisticUpdateCallback(
      email
    )) as InviteActionResults;
    if (!result.supabaseInsertSuccess) {
      if (result.userDoesNotExist) {
        toast.error(`User does not exist!`);
      } else if (result.userAlreadyInClass) {
        toast.error(`User already in class!`);
      } else {
        toast.error(
          `Uh oh! Something went wrong when inviting member to classroom.`,
          {
            description: `Please refresh and try again`,
          }
        );
      }
    } else {
      toast.success(`Invited user with email ${email} successfully!`);
    }
    setIsDialogOpen(false);
    setIsPending(false);
    setEmail("");
    return;
  };

  return (
    // <div className="my-3 flex gap-5">
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {dialogTrigger ?? (
        <DialogTrigger asChild>
          <Button
            variant="outline"
            effect={"hoverUnderline"}
            className="max-[740px]:w-3/5"
          >
            Invite Member <UserPlus />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Enter the email of the member you would like to invite to your
            classroom here.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              className="col-span-3"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={inviteCallback} type="submit">
            {isPending && <Loader2 className="animate-spin" />}
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    // </div>
  );
}
