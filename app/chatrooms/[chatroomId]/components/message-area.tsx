"use client";

import { ChatClientWithSession } from "@shared/lib/ragflow/chat/chat-client";
import { UserContext } from "@shared/lib/userContext/userContext";
import { Skeleton } from "@shared/components/ui/skeleton";
import { toast } from "@shared/hooks/use-toast";
import { createClient } from "@shared/utils/supabase/client";
import { Database, Tables } from "@shared/utils/supabase/database.types";
// import { revalidatePath } from "next/cache";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import { askLLM } from "../../actions";
import { createBrowserClient } from "@supabase/ssr";
import config from "../../config";

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
      toast({
        variant: "destructive",
        title: "Error sending message to chatroom",
        description: "Please refresh and try again",
      });
      setMessageBoxValue("");
      return;
    }

    // Handle user "/ask" command
    if (isAskCommand) {
      const askResult = await askLLM(classroomInfo, chatroomId, chatClient);
      if (!askResult.clientCreationSuccess) {
        if (!askResult.failedBecauseEmptyDataset) {
          // TODO: ask result has more detailed error differntiations if we want to tell the user
          toast({
            variant: "destructive",
            title: "Error sending communicating with LLM",
            description: "Please refresh and try again",
          });
          setChatClient(null); // In case client is bad, clear it out
          setMessageBoxValue("");
          return;
        }
      }
      setChatClient(askResult.client);
    }
    setMessageBoxValue("");
    //  // TODO: need to chagne this revalidate path
    //  revalidatePath(`/chatrooms/${chatroomId}`);
  };

  return (
    <div className="flex-grow overflow-auto">
      <div className="border-t p-4 text-black">
        <textarea
          id="chat"
          rows={1}
          className="mx-2 block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          placeholder="Your message..."
          value={messageBoxValue}
          onChange={(e) => {
            setMessageBoxValue(e.target.value);
          }}
        />
        <button
          onClick={sendMessageToChatroom}
          className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Send
        </button>
      </div>
      <div className="space-y-2 p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message, index) => {
            const isLLM = message.user_id === "llm";

            return (
              <div
                key={message.id || index}
                className="flex items-start gap-3 rounded border p-3"
              >
                {isLLM ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-200 text-sm font-medium text-blue-600">
                    AI
                  </div>
                ) : message.avatar_url ? (
                  <Image
                    src={message.avatar_url}
                    alt={message.full_name || "User"}
                    referrerPolicy="no-referrer"
                    width={25}
                    height={25}
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                    {message.full_name?.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">
                      {isLLM
                        ? "AI Assistant"
                        : message.full_name || "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-1">{message.content}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageArea;
