"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket;

const CollaborativeChat: React.FC = () => {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    // Trigger the API to initialize Socket.IO
    fetch("/api/socket");

    // Connect to the Socket.IO server
    socket = io();

    // Listen for messages from the server
    socket.on("message", (msg: string) => {
      setChat((prevChat) => [...prevChat, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      // Emit the message to the server
      socket.emit("message", message);
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Collaborative Chat Prototype</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {chat.map((msg, index) => (
          <div key={index} style={{ marginBottom: "5px" }}>
            {msg}
          </div>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "80%", marginRight: "10px" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default CollaborativeChat;
