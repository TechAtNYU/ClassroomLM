"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveChatroom } from "@/app/chatrooms/actions";
import { Button } from "@/shared/components/ui/button";
import { DoorOpen } from "lucide-react";

export default function LeaveChatroomButton({
  classroomId,
  chatroomId,
}: {
  classroomId: number;
  chatroomId: string;
}) {
  const [isLeaving, setIsLeaving] = useState(false);
  const router = useRouter();

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave this chatroom?")) {
      setIsLeaving(true);
      try {
        await leaveChatroom(chatroomId);
        router.push(`/classrooms/${classroomId}/chatrooms`);
      } catch (error) {
        console.error("Error leaving chatroom:", error);
        alert("Failed to leave chatroom. Please try again.");
      } finally {
        setIsLeaving(false);
      }
    }
  };

  return (
    <Button
      size={"sm"}
      onClick={handleLeave}
      disabled={isLeaving}
      variant={"destructive"}
    >
      <DoorOpen />
      {isLeaving ? "Leaving..." : "Leave"}
    </Button>
  );
}
