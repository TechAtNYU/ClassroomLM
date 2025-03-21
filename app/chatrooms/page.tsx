import { createClient } from "@/utils/supabase/server";

const ChatroomsPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No authenticated user found");
  }
  const currentUser = user.id;
  const classroomMembers = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("user_id", currentUser);

  const memberIds = classroomMembers.data?.map((element) => element.id) || [];

  const chatroomIds = [];

  for (const memberId of memberIds) {
    const { data, error } = await supabase
      .from("Chatroom_Members")
      .select("chatroom_id")
      .eq("member_id", memberId);

    if (data && !error) {
      for (const element of data) {
        chatroomIds.push(element.chatroom_id);
      }
    }
  }
  console.log(chatroomIds);

  const chatrooms = [];

  for (const chatroomId of chatroomIds) {
    const { data, error } = await supabase
      .from("Chatrooms")
      .select("*")
      .eq("id", chatroomId)
      .single();

    if (data && !error) {
      chatrooms.push(data);
    }
  }

  return (
    <div>
      <h1>Your Chatrooms</h1>
      <pre>{JSON.stringify(chatrooms, null, 2)}</pre>
    </div>
  );
};

export default ChatroomsPage;
