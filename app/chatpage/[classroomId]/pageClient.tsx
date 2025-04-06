"use client"; // Must be a client component

import { useState } from "react";
import { sendChat } from "./actions"; // Adjust path if needed

export default function ChatForm({ assistant_id, sessionID, userID }) {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`this is id  ${assistant_id}`);
    const chat = await sendChat(assistant_id, sessionID, userID, message); // Call the server action
    console.log(assistant_id, sessionID, userID, message);
    console.log(chat);
    setMessage(""); // Clear input after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
        required
      />
      <button type="submit">Send</button>
    </form>
  );
}
