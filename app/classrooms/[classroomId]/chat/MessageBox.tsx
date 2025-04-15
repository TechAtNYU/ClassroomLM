"use client";
import { useState } from "react";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@shared/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@shared/components/ui/chat/chat-message-list";
import { ChatInput } from "@shared/components/ui/chat/chat-input";
import { Button } from "@/shared/components/ui/button";
import {
  ChatClientWithSession,
  RagFlowMessage,
  RagFlowMessages,
  sendMessage,
} from "@shared/lib/ragflow/chat/chat-client";
import { toast } from "sonner";
import Logo from "@/shared/components/Logo";
import { SendIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MessageBoxProps {
  chatClient: ChatClientWithSession;
  messageHistory: RagFlowMessages | null;
}

export default function MessageBox({
  chatClient,
  messageHistory,
}: MessageBoxProps) {
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<RagFlowMessages>(
    messageHistory || []
  );
  const [isLoading, setIsLoading] = useState(false);

  function cleanMessage(content: string): string {
    return content.replace(/\s##\d+\$\$/g, "").trim();
  }

  async function handleSend() {
    if (!value.trim()) return;

    const userMessage: RagFlowMessage = { role: "user", content: value };
    setMessages((prev) => [...prev, userMessage]);
    setValue("");
    setIsLoading(true);
    const response = await sendMessage(chatClient, value);
    setIsLoading(false);

    if (!response.ragflowCallSuccess) {
      toast.error("Error sending message", {
        description: `Please try refreshing the page`,
        duration: 10000,
      });
      return;
    }

    const assistantMessage: RagFlowMessage = {
      role: "assistant",
      content: response.response,
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }

  return (
    <div className="flex h-[80vh] min-h-[400px] w-11/12 flex-col place-self-center rounded border p-4 text-gray-800 shadow dark:text-white max-[500px]:w-full">
      <Logo
        className={
          "size-[6vmin] h-fit min-w-10 place-self-center stroke-black stroke-[10px]"
        }
      />
      <div className="flex-1 overflow-auto">
        <ChatMessageList smooth className="max-[500px]:px-0">
          {messages.map((msg, index) => (
            <ChatBubble
              key={index}
              variant={msg.role === "assistant" ? "received" : "sent"}
              className="max-w-[80%]"
            >
              {msg.role === "assistant" ? (
                <ChatBubbleAvatar fallback="AI" />
              ) : (
                <ChatBubbleAvatar fallback="Me" />
              )}
              <ChatBubbleMessage
                variant={msg.role === "assistant" ? "received" : "sent"}
                className="prose p-2 font-medium marker:text-inherit"
              >
                <ReactMarkdown>{cleanMessage(msg.content)}</ReactMarkdown>
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
          {isLoading && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar fallback="AI" />
              <ChatBubbleMessage isLoading variant="received" />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      <div className="flex w-full items-center justify-between gap-2 rounded-lg border bg-background p-1">
        <ChatInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message..."
          onEnter={handleSend}
          className="focus-visible:ringof min-h-10 resize-none border-0 bg-background shadow-none focus-visible:ring-0"
        />
        <Button onClick={handleSend} size="sm" className="ml-auto mr-3">
          Send <SendIcon />
        </Button>
      </div>
    </div>
  );
}
