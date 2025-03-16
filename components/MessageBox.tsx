"use client";
import { useState } from "react";

import { sendMessage } from "@/app/chat/[classroomId]/actions";

function MessageBox(props: { assistantID: string }) {
  const [value, setValue] = useState("");

  const [messages, setMessage] = useState<{ type: string; message: string }[]>(
    []
  );

  async function handle() {
    const ownMessage = { type: "user", message: value };

    setMessage((oldArray) => [...oldArray, ownMessage]);

    setValue("");

    const response: string = await sendMessage(value, props.assistantID);

    // alert(response);
    // alert("can we even print anything");

    const messageData = { type: "assistant", message: response };

    setMessage((oldArray) => [...oldArray, messageData]);
    // console.log("response thingy2", messages);
  }

  return (
    <div className="p-4 text-gray-800 dark:text-white">
      <h1 className="mb-4 text-2xl font-bold">Chat:</h1>

      <div>
        {messages.map((aMessage) => (
          <div key={aMessage.message}>
            {aMessage.type == "assistant" && (
              <h1 className="mt-2 w-60 rounded-md bg-purple-500 p-3 text-white hover:bg-purple-600">
                {aMessage.message}
              </h1>
            )}
            {aMessage.type != "assistant" && (
              <h1 className="ml-40 mt-2 w-60 rounded-md bg-green-500 p-3 text-white hover:bg-green-600">
                {aMessage.message}
              </h1>
            )}
          </div>
        ))}
      </div>

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
  );
}

export default MessageBox;
