import { Separator } from "@/shared/components/ui/separator";
import { createClient } from "@shared/utils/supabase/server";
import Link from "next/link";
import { CreateChatroomDialog } from "./_components/create-chatroom-dialog";

const ChatroomsPage = async ({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("No authenticated user found");
  }

  const { classroomId } = await params;

  const currentUser = user.id;

  // Get all chatrooms that user joined for this classroom
  const { data: chatroomMembers, error: chatroomMembersError } = await supabase
    .from("Chatroom_Members")
    .select(
      `
    *,
    Chatrooms(
      id,
      name,
      classroom_id,
      creater_user_id,
      Classrooms(
        name,
        chatroom_assistant_id
      )
    ),
    Classroom_Members!inner(
      user_id,
      classroom_id
    )
  `
    )
    .eq("Classroom_Members.user_id", currentUser)
    .eq("Classroom_Members.classroom_id", parseInt(classroomId, 10))
    .eq("is_active", true);

  if (chatroomMembersError) {
    console.error("Error fetching chatrooms:", chatroomMembersError);
    throw new Error("Error fetching chatrooms");
  }

  const chatrooms = chatroomMembers.map((member) => member.Chatrooms);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-medium tracking-tight">Chatrooms</h1>

        <CreateChatroomDialog classroomId={classroomId} />
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chatrooms.length > 0 ? (
          chatrooms.map((chatroom) => (
            <div key={chatroom.id} className="rounded-lg border p-4 shadow-sm">
              <h2 className="mb-2 text-xl font-semibold">{chatroom.name}</h2>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/chatrooms/${chatroom.id}`}
                  className="inline-block rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Enter Chatroom
                </Link>
              </div>
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
