import { createClient } from "@/utils/supabase/server";
import NewMessages from "./components/new-messages";

const ChatroomPage = async ({
  params,
}: {
  params: Promise<{ chatroomId: string }>;
}) => {
  const { chatroomId } = await params;
  const supabase = await createClient();

  const { data: chatroomMembers, error: membersError } = await supabase
    .from("Chatroom_Members")
    .select("id")
    .eq("chatroom_id", chatroomId);

  if (membersError) {
    console.error("Error fetching chatroom members:", membersError);
    return <div>Error loading chatroom</div>;
  }

  const memberIds = chatroomMembers?.map((member) => member.id) || [];

  if (memberIds.length === 0) {
    console.log("No members found for chatroom:", chatroomId);
    return <NewMessages chatHistory={[]} chatroomId={chatroomId} />;
  }

  const { data: messages, error: messagesError } = await supabase
    .from("Messages")
    .select("*")
    .in("member_id", memberIds)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
  }

  return <NewMessages chatHistory={messages ?? []} chatroomId={chatroomId} />;
};

export default ChatroomPage;
