"use client";
import { useState } from "react";
import { inviteMemberToClassroom } from "./actions";

export default function InviteMember({ classroomId }: { classroomId: number }) {
  const [email, setEmail] = useState("");
  const handleInvite = async () => {
    try {
      await inviteMemberToClassroom(email, classroomId);
      setEmail("");
    } catch (error: unknown) {
      //type unknown for typescript lint
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Error Occured");
      }
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ color: "black" }}
      />

      <button onClick={handleInvite}>Invite</button>
    </div>
  );
}
