// "use server"

import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { Input } from "@shared/components/ui/input";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ReactNode, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";

export default function InviteInfoDialog({
  code,
  classroomName,
  dialogTrigger,
}: {
  code: string;
  classroomName: string;
  dialogTrigger?: ReactNode;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const TIMEOUT = 4000;

  let joinUrl = "";
  if (typeof window !== "undefined") {
    joinUrl = `${window.location.origin}/classrooms/join/${code}`;
  }

  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, TIMEOUT);
    }, console.error);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {dialogTrigger ?? (
        <DialogTrigger asChild className="">
          <Button
            variant="outline"
            effect={"hoverUnderline"}
            className="flex gap-2"
          >
            <Share2 /> Share
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>Invite to {classroomName}</DialogTitle>
          <DialogDescription>
            Have members join using this link or from the Join button their
            classroom page.
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full gap-2">
          <Input className="w-full" readOnly value={joinUrl} />
          <Button
            type="submit"
            size="sm"
            className="h-full px-3"
            onClick={() => copyToClipboard(joinUrl)}
          >
            <span className="sr-only">Copy</span>
            {!isCopied ? (
              <Copy />
            ) : (
              <div className="flex gap-1">
                <Check className="self-center" /> Copied
              </div>
            )}
          </Button>
        </div>
        <InputOTP isShare disabled maxLength={8} value={code.toUpperCase()}>
          <InputOTPGroup>
            <InputOTPSlot isLarge index={0} />
            <InputOTPSlot isLarge index={1} />
            <InputOTPSlot isLarge index={2} />
            <InputOTPSlot isLarge index={3} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot isLarge index={4} />
            <InputOTPSlot isLarge index={5} />
            <InputOTPSlot isLarge index={6} />
            <InputOTPSlot isLarge index={7} />
          </InputOTPGroup>
        </InputOTP>
      </DialogContent>
    </Dialog>
  );
}
