"use client";

import { createClient } from "@/utils/supabase/client";
import { Tables } from "@/utils/supabase/database.types";
import Image from "next/image";
import { useEffect, useState } from "react";

const supabase = createClient();

interface Message extends Tables<"Messages"> {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const NewMessages = ({
  chatHistory,
  chatroomId,
}: {
  chatHistory: Message[];
  chatroomId: string;
}) => {
  const [messages, setMessages] = useState(chatHistory);

  useEffect(() => {
    const fetchMemberIds = async () => {
      const { data: members } = await supabase
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
        .eq("chatroom_id", chatroomId);

      return members || [];
    };

    fetchMemberIds().then((members) => {
      const room = supabase.channel(`chatroom-${chatroomId}`);
      members.forEach((member) => {
        room.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "Messages",
            filter: `member_id=eq.${member.id}`,
          },
          (payload) => {
            const messageRaw = payload.new as Tables<"Messages">;

            const message: Message = {
              ...messageRaw,
              user_id: member.Classroom_Members.Users.id,
              full_name: member.Classroom_Members.Users.full_name,
              avatar_url: member.Classroom_Members.Users.avatar_url,
            };

            setMessages((prevMessages) => [...prevMessages, message]);
          }
        );
      });

      room.subscribe();

      return () => {
        supabase.removeChannel(room);
      };
    });
  }, [chatroomId]);

  return (
    <div className="space-y-2 p-4">
      {messages.length === 0 ? (
        <p className="text-gray-500">
          No messages yet. Start the conversation!
        </p>
      ) : (
        messages.map((message, index) => {
          return (
            <div
              key={message.id || index}
              className="flex items-start gap-3 rounded border p-3"
            >
              {message.avatar_url ? (
                <Image
                  src={message.avatar_url}
                  alt={message.full_name || "User"}
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
                    {message.full_name || "Unknown User"}
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
  );
};

export default NewMessages;
