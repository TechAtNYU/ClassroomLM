"use client";
import { useState } from "react";
import {
  ChatClientWithSession,
  RagFlowMessage,
  RagFlowMessages,
  sendMessage,
} from "@/app/lib/ragflow/chat/chat-client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

function MessageBox(props: {
  chatClient: ChatClientWithSession;
  messageHistory: RagFlowMessages | null;
}) {
  const [value, setValue] = useState("");

  const [messages, setMessage] = useState<RagFlowMessages>(
    props.messageHistory ? props.messageHistory : []
  );

  function cleanMessage(content: string): string {
    // Remove any reference patterns like ##number$$
    return content.replace(/##\d+\$\$/g, "").trim();
  }

  async function handle() {
    const ownMessage = { role: "user", content: value } as RagFlowMessage;

    setMessage((oldArray) => [...oldArray, ownMessage]);

    setValue("");

    const messageResponse = await sendMessage(props.chatClient, value);

    if (!messageResponse.ragflowCallSuccess) {
      toast({
        title: "Error sending message",
        description: `Please try refreshing the page`,
        duration: 10000,
        variant: "destructive",
      });
      return;
    }

    const messageData = {
      role: "assistant",
      content: messageResponse.response,
    } as RagFlowMessage;

    setMessage((oldArray) => [...oldArray, messageData]);
    // console.log("response thingy2", messages);
  }

  return (
    <div className="min-h-screen w-1/2 flex-col justify-self-center p-4 text-gray-800 dark:text-white">
      <h1 className="mb-4 text-2xl font-bold">Chat:</h1>

      <div className="flex-col rounded-t-lg bg-gray-100 p-3">
        {messages.map((aMessage, idx) => (
          <div
            key={idx}
            className={`my-2 max-w-md rounded-lg p-3 shadow-md ${
              aMessage.role != "assistant"
                ? "justify-self-end bg-green-200 hover:bg-green-300"
                : "justify-self-start bg-blue-200 hover:bg-blue-300"
            }`}
          >
            <div className="font-medium prose prose-gray">
              <ReactMarkdown
                // components={{
                //   ul: ({...props }) => (
                //     <ul
                //       className="markdown list-disc px-[20px] block"
                //       {...props}
                //     />
                //   ),
                //   ol: ({ ...props }) => (
                //     <ul
                //     className="markdown list-decimal px-[20px] block"
                //                           {...props}
                //     />
                //   ),
                // }}
              >
                {cleanMessage(aMessage.content)}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      {/* <div className="justify-self-end"> */}
      <div className="flex items-center rounded-b-lg bg-gray-200 px-4 py-2 dark:bg-gray-700">
        <textarea
          id="chat"
          rows={1}
          className="mx-2 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Your message..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        ></textarea>
        <button
          onClick={handle}
          className="inline-flex cursor-pointer justify-center rounded-full p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600"
        >
          <svg
            className="h-5 w-5 rotate-90 rtl:-rotate-90"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 20"
          >
            <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
          </svg>
          <span className="sr-only">Send message</span>
        </button>

        {/* <input
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
      </button> */}
      </div>
    </div>
  );
}

export default MessageBox;
