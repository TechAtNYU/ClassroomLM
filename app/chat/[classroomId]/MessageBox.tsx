"use client";
import { useState } from "react";
import { sendMessage } from "./actions";

function MessageBox(props: {
  assistantId: string;
  userId: string;
  chatSessionId: string;
}) {
  const [value, setValue] = useState("");

  const [messages, setMessage] = useState<{ type: string; message: string }[]>(
    []
  );

  async function handle() {
    const ownMessage = { type: "user", message: value };

    setMessage((oldArray) => [...oldArray, ownMessage]);

    setValue("");

    const response: string = await sendMessage(
      value,
      props.assistantId,
      props.userId,
      props.chatSessionId
    );

    // alert(response);
    // alert("can we even print anything");

    const messageData = { type: "assistant", message: response };

    setMessage((oldArray) => [...oldArray, messageData]);
    // console.log("response thingy2", messages);
  }

  return (
    <div className="min-w-screen min-h-screen flex-col p-4 text-gray-800 dark:text-white">
      <h1 className="mb-4 text-2xl font-bold">Chat:</h1>

      <div className="flex-col bg-gray-100 p-3">
        {messages.map((aMessage) => (
          <div
            key={aMessage.message}
            className={`my-2 max-w-md rounded-lg p-3 shadow-md ${
              aMessage.type != "assistant"
                ? "justify-items-end bg-green-200 hover:bg-green-300"
                : "justify-items-start bg-blue-200 hover:bg-blue-300"
            }`}
          >
            <p className="font-medium text-gray-800">{aMessage.message}</p>
          </div>
        ))}
      </div>
      <div className="justify-self-end">
        <input
          type="text"
          placeholder="Type your message here..."
          className="w-100 rounded-md border border-gray-300 p-2 dark:bg-gray-700 dark:text-white"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />

        <button
          className="ml-4 mt-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handle}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default MessageBox;
