// "use server"

import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { ReactNode, useState } from "react";
import { UserPlus } from "lucide-react";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

export default function JoinDialog({
  dialogTrigger,
}: {
  dialogTrigger?: ReactNode;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [joinValue, setJoinValue] = useState("");

  const router = useRouter();

  const joinButtonCallback = () => {
    if (joinValue.length == 8) {
      router.push(`/classrooms/join/${joinValue}`);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(val) => {
        setIsDialogOpen(val);
        if (val == true) {
          setJoinValue("");
        }
      }}
    >
      {dialogTrigger ?? (
        <DialogTrigger asChild className="">
          <Button variant="default" className="flex gap-2">
            <UserPlus /> Join
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-fit">
        <DialogHeader>
          <DialogTitle>Join a classroom</DialogTitle>
          <DialogDescription>Enter join code:</DialogDescription>
        </DialogHeader>

        <InputOTP
          maxLength={8}
          pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
          value={joinValue}
          onChange={(value) => setJoinValue(value)}
        >
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

        <Button type="submit" size="sm" onClick={() => joinButtonCallback()}>
          Join
        </Button>
      </DialogContent>
    </Dialog>
  );
}
