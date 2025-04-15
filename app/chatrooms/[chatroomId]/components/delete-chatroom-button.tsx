"use client";

import { deleteChatroom } from "@/app/chatrooms/actions";
import { Button } from "@/shared/components/ui/button";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteChatroomButton({
  classroomId,
  chatroomId,
  assistantId,
}: {
  classroomId: number;
  chatroomId: string;
  assistantId: string | null;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this chatroom?")) {
      setIsDeleting(true);
      try {
        await deleteChatroom(chatroomId, assistantId);
        router.push(`/classrooms/${classroomId}/chatrooms`);
      } catch (error) {
        console.error("Error deleting chatroom:", error);
        alert("Failed to delete chatroom. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Button
      size={"sm"}
      onClick={handleDelete}
      disabled={isDeleting}
      variant={"destructive"}
    >
      <Trash2 />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
