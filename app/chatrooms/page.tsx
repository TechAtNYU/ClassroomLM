import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const ChatroomsPage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No authenticated user found");
  }
  const currentUser = user.id;

  // get all the classrooms that current user joined
  const classroomMembers = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("user_id", currentUser);

  const memberIds = classroomMembers.data?.map((element) => element.id) || [];

  // get all the chatroomsIds that current user joined
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

  // get all the chatrooms that current uesr joined
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
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Your Chatrooms</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chatrooms.length > 0 ? (
          chatrooms.map((chatroom) => (
            <div key={chatroom.id} className="rounded-lg border p-4 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">
                {chatroom.name || `Chatroom ${chatroom.id}`}
              </h2>
              <Link
                href={`/chatrooms/${chatroom.id}`}
                className="inline-block rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                Enter Chatroom
              </Link>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center">
            <p className="text-gray-500">
              You don&apos;t have any chatrooms yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatroomsPage;
