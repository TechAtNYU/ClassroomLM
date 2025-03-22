import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import LeaveChatroomButton from "./components/leave-chatroom-button";
import NewMessages from "./components/new-messages";
import { sendMessageToChatroom } from "../actions";

const ChatroomPage = async ({
  params,
}: {
  params: Promise<{ chatroomId: string }>;
}) => {
  const { chatroomId } = await params;
  const supabase = await createClient();

  // Get current chatroom details
  const { data: chatroom, error: chatroomError } = await supabase
    .from("Chatrooms")
    .select("*")
    .eq("id", chatroomId)
    .single();

  if (chatroomError) {
    redirect("/chatrooms");
  }

  // get user's chatroom member Id
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No authenticated user found");
  }

  const currentUser = user.id;

  const { data: currentClassroomMember } = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("classroom_id", chatroom.classroom_id)
    .eq("user_id", currentUser)
    .single();

  const { data: chatroomMembers, error: membersError } = await supabase
    .from("Chatroom_Members")
    .select("*")
    .eq("chatroom_id", chatroomId);

  if (membersError) {
    console.error("Error fetching chatroom members:", membersError);
    return <div>Error loading chatroom</div>;
  }

  const classroomMemberIds =
    chatroomMembers?.map((member) => member.member_id) || [];
  const chatroomMemberIds = chatroomMembers?.map((member) => member.id) || [];

  console.log(currentClassroomMember?.id);

  // if user is not in this chatroom redirect to /chatrooms
  if (
    !currentClassroomMember ||
    !classroomMemberIds.includes(currentClassroomMember.id)
  ) {
    redirect("/chatrooms");
  }

  // get current chatroom member id
  const { data: currentChatroomMember, error: currentChatroomMemberError } =
    await supabase
      .from("Chatroom_Members")
      .select("id")
      .eq("chatroom_id", chatroomId)
      .eq("member_id", currentClassroomMember.id)
      .single();

  if (currentChatroomMemberError) {
    redirect("/chatrooms");
  }

  const { data: messages, error: messagesError } = await supabase
    .from("Messages")
    .select("*")
    .in("member_id", chatroomMemberIds)
    .order("created_at", { ascending: true });

  if (messagesError) {
    console.error("Error fetching messages:", messagesError);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-xl font-bold">{chatroom.name}</h1>
        <div className="flex gap-2">
          {currentUser !== chatroom.user_id && (
            <LeaveChatroomButton
              chatroomId={chatroomId}
              classroomId={chatroom.classroom_id}
            />
          )}
          <Link
            href="/chatrooms"
            className="rounded bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            Back to Chatrooms
          </Link>
        </div>
      </div>
      <div className="flex-grow overflow-auto">
        <NewMessages chatHistory={messages ?? []} chatroomId={chatroomId} />
      </div>
      <div className="border-t p-4 text-black">
        <form action={sendMessageToChatroom} className="flex gap-2">
          <input type="hidden" name="chatroomId" value={chatroomId} />
          <input
            type="hidden"
            name="chatroomMemberId"
            value={currentChatroomMember.id}
          />
          <input
            type="text"
            name="message"
            placeholder="Type your message..."
            className="flex-grow rounded border p-2"
            required
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatroomPage;
