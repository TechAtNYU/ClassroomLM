"use client";
import { UUID } from "crypto";
import { getCurrentUserId } from "../../lib/supabase-api";
import { getChatSession } from "@/controllers/getChatController";
//import { getUserID } from "@/app/classroom/actions";
//import { useState } from "react";
import { useParams } from "next/navigation";

export default function Home({ params }: { params: { classroomId: string } }) {
  let sessionID: UUID;
  const userID = getCurrentUserId();
  const { classroomID } = useParams();

  async function startSession() {
    const sessionIDResponse = await getChatSession(userID, classroomID);
    sessionID = sessionIDResponse.session;
  }

  async function sendChat() {
    // get the two params
    const prompt = document.getElementById("prompt");

    //const promptResponse = await chatController(classroomID, sessionID, prompt);

    //const response = promptResponse.response;

    const responseDisplay = document.getElementById("responses");

    if (responseDisplay != null) {
      //responseDisplay.textContent += "\n" + response;
    }
  }
  const [messages, setMessages] = useState([
    { text: "Hello! How can I assist you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages([...messages, userMessage]);
    setInput("");

    //Change this to handle chat controller
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.reply, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        height: "500px",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: "10px",
              borderRadius: "8px",
              maxWidth: "80%",
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              backgroundColor: msg.sender === "user" ? "#007bff" : "#f0f0f0",
              color: msg.sender === "user" ? "white" : "black",
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "10px",
          borderTop: "1px solid #ccc",
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "10px 15px",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
