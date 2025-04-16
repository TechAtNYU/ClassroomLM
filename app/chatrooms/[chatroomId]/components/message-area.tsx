"use client";

import { ChatClientWithSession } from "@shared/lib/ragflow/chat/chat-client";
import { UserContext } from "@shared/lib/userContext/userContext";
import { Skeleton } from "@shared/components/ui/skeleton";
import { createClient } from "@shared/utils/supabase/client";
import { Database, Tables } from "@shared/utils/supabase/database.types";
import { useContext, useEffect, useState } from "react";
import { askLLM } from "../../actions";
import { createBrowserClient } from "@supabase/ssr";
import config from "../../config";
import { ChatMessageList } from "@/shared/components/ui/chat/chat-message-list";
import { ChatInput } from "@/shared/components/ui/chat/chat-input";
import { Button } from "@/shared/components/ui/button";
import { SendIcon } from "lucide-react";
import {
  AIAvatar,
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/shared/components/ui/chat/chat-bubble";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import Logo from "@/shared/components/Logo";
import { Separator } from "@/shared/components/ui/separator";

interface Message extends Tables<"Messages"> {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

type ChatroomMemberRecord = {
  chatroom_id: string;
  created_at: string;
  id: number;
  is_active: boolean;
  member_id: number;
  Classroom_Members: {
    id: number;
    user_id: string;
    classroom_id: number;
    Users: {
      id: string;
      full_name: string | null;
      avatar_url: string | null;
    };
  };
};

const MessageArea = ({
  chatHistory,
  chatroomId,
  chatroomMemberRecord,
  supabaseClientUrl,
  supabaseClientKey,
}: {
  chatHistory: Message[];
  chatroomId: string;
  chatroomMemberRecord: ChatroomMemberRecord;
  supabaseClientUrl: string;
  supabaseClientKey: string;
}) => {
  const [messages, setMessages] = useState(chatHistory);
  const [chatClient, setChatClient] = useState<ChatClientWithSession | null>(
    null
  );
  const [messageBoxValue, setMessageBoxValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // add database changes to messages state
  useEffect(() => {
    const supabase = createBrowserClient<Database>(
      supabaseClientUrl,
      supabaseClientKey
    );
    const room = supabase.channel(`chatroom-${chatroomId}`);

    room.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "Messages",
        filter: `chatroom_id=eq.${chatroomId}`,
      },
      async (payload) => {
        const messageRaw = payload.new as Tables<"Messages">;

        // handle LLM message
        if (messageRaw.member_id === null) {
          const llmMessage: Message = {
            ...messageRaw,
            user_id: config.llmId,
            full_name: config.llmName,
            // TODO: We might need an avatar for assitant
            avatar_url: config.llmAvatar,
          };
          setMessages((prevMessages) => [...prevMessages, llmMessage]);
          return;
        }

        // For user messages, fetch the user details
        try {
          const { data: memberData } = await supabase
            .from("Chatroom_Members")
            .select(
              `
              *,
              Classroom_Members(
                Users(
                  id,
                  full_name,
                  avatar_url
                )
              )
            `
            )
            .eq("id", messageRaw.member_id)
            .single();

          if (memberData) {
            const message: Message = {
              ...messageRaw,
              user_id: memberData.Classroom_Members.Users.id,
              full_name: memberData.Classroom_Members.Users.full_name,
              avatar_url: memberData.Classroom_Members.Users.avatar_url,
            };

            setMessages((prevMessages) => [...prevMessages, message]);
          }
        } catch (error) {
          console.error("Error fetching message user details:", error);
        }
      }
    );

    // Subscribe to the channel
    room.subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(room);
    };
  }, [chatroomId, supabaseClientKey, supabaseClientUrl]);

  // TODO: get all avatars/user info from here at the beginning using the context instead of every message
  const userContext = useContext(UserContext);
  // // If the userContext is undefined still, give loading visual
  if (!userContext) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  // // get the data and setter from the context (these are just a regular useState, so treat them like that)
  const { userAndClassData } = userContext;
  //  const userId = userAndClassData.userData.id;

  const classroomInfo = userAndClassData.classroomsData.find(
    (x) => x.id === chatroomMemberRecord.Classroom_Members.classroom_id
  );
  if (!classroomInfo) {
    console.log(
      "Error rendering chatroom page, member of chatroom but didn't find information about the underlying classroom"
    );
    return (
      // TODO: make 404 page since this is a classroom not found
      <h1> 404 </h1>
    );
  }

  // Send the message directly from the browser, and also tell the server action if an LLM is involved
  const sendMessageToChatroom = async () => {
    const supabase = createClient();
    let content = messageBoxValue;
    const isAskCommand = content.startsWith("/ask ");
    if (isAskCommand) {
      content = content.substring(5).trim();
    }

    if (!content) {
      console.log("Message should not be empty");
      setMessageBoxValue("");
      return null;
    }

    // Insert the message
    const { error: messageError } = await supabase.from("Messages").insert([
      {
        content,
        member_id: chatroomMemberRecord.id,
        chatroom_id: chatroomId,
        is_ask: isAskCommand,
      },
    ]);

    if (messageError) {
      toast.error("Error sending message to chatroom", {
        description: "Please refresh and try again",
      });
      setMessageBoxValue("");
      return;
    }

    setMessageBoxValue("");
    setIsLoading(true);
    // Handle user "/ask" command
    if (isAskCommand) {
      const askResult = await askLLM(classroomInfo, chatroomId, chatClient);
      if (!askResult.clientCreationSuccess) {
        if (!askResult.failedBecauseEmptyDataset) {
          // TODO: ask result has more detailed error differentiations if we want to tell the user
          toast.error("Error sending communicating with LLM", {
            description: "Please refresh and try again",
          });
          setChatClient(null); // In case client is bad, clear it out
          setMessageBoxValue("");
          return;
        }
      }
      setChatClient(askResult.client);
    }
    setIsLoading(false);
  };

  function cleanMessage(content: string): string {
    // Remove any reference patterns like ##number$$
    return content.replace(/\s##\d+\$\$/g, "").trim();
  }
  let previousMessageTime: Date | undefined = undefined;
  return (
    <div className="mt-5 flex min-h-[400px] w-11/12 flex-1 flex-col place-self-center rounded border p-4 text-gray-800 shadow dark:text-white max-[500px]:w-full">
      <Logo
        className={
          "size-[6vmin] h-fit min-w-10 place-self-center fill-foreground stroke-foreground stroke-[10px]"
        }
      />
      {/* <div className="mt-10 flex w-11/12 flex-col place-self-center rounded border p-4 text-gray-800 shadow dark:text-white"> */}
      <div className="flex-1 overflow-auto">
        <ChatMessageList smooth className="max-[500px]:px-0">
          {messages.flatMap((message) => {
            const variant =
              message.user_id === userAndClassData.userData.id
                ? "sent"
                : "received";

            // Format the timestamp
            const messageTime = new Date(message.created_at);
            const formattedTime = messageTime.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
            });
            const formattedDay = new Date(
              message.created_at
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const elements = [];
            if (
              !previousMessageTime ||
              isDifferentDay(messageTime, previousMessageTime)
            ) {
              elements.push(
                <div
                  key={messageTime.getMilliseconds()}
                  className="flex items-center justify-center gap-4"
                >
                  <Separator className="w-[20%]" />
                  <span className="text-muted-foreground">{formattedDay}</span>
                  <Separator className="w-[20%]" />
                </div>
              );
            }
            previousMessageTime = messageTime;
            elements.push(
              <ChatBubble
                key={message.id}
                variant={variant}
                className="max-w-[80%]"
              >
                {!message?.member_id ? (
                  <AIAvatar />
                ) : (
                  <ChatBubbleAvatar src={message.avatar_url!} fallback="Me" />
                )}
                <div className="flex flex-col">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    {message?.member_id
                      ? (message.full_name ?? "Unknown")
                      : AIFullNameFormatted("AI Assistant")}
                    • {formattedTime}
                    {message.is_ask && (
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        Ask LLM
                      </span>
                    )}
                  </div>
                  <ChatBubbleMessage
                    className="prose w-fit !whitespace-normal p-2 font-medium marker:text-inherit"
                    variant={variant}
                  >
                    <ReactMarkdown>
                      {cleanMessage(message.content)}
                    </ReactMarkdown>
                  </ChatBubbleMessage>
                </div>
              </ChatBubble>
            );
            return elements;
          })}
          {isLoading && (
            <ChatBubble variant="received">
              <AIAvatar />
              <ChatBubbleMessage isLoading variant="received" />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>
      <div className="relative mt-4 flex items-center justify-between gap-2 rounded-lg border bg-background p-1">
        <ChatInput
          value={messageBoxValue}
          onChange={(e) => setMessageBoxValue(e.target.value)}
          placeholder="Type your message or use /ask [message] to pull the LLM into the conversation..."
          onEnter={sendMessageToChatroom}
          className="focus-visible:ringof min-h-10 resize-none border-0 bg-background shadow-none focus-visible:ring-0"
        />
        <Button
          onClick={sendMessageToChatroom}
          size="sm"
          className="ml-auto mr-3"
        >
          Send <SendIcon />
        </Button>
      </div>
    </div>
  );
};

function isDifferentDay(date1: Date, date2: Date) {
  return !(
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

function AIFullNameFormatted(name: string) {
  return (
    <span className="inline-flex items-center text-xs font-medium text-purple-500 dark:text-purple-200">
      {name}
    </span>
  );
}
export default MessageArea;
