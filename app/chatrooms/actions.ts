"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const createChatroom = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No authenticated user found");
  }

  const name = (formData.get("name") as string) || "New Chatroom";
  const classroom_id = parseInt(formData.get("classroom_id") as string);

  // Create a new chatroom
  const { data: chatroomData, error: chatroomError } = await supabase
    .from("Chatrooms")
    .insert([
      {
        name,
        classroom_id,
        user_id: user.id,
      },
    ])
    .select("*")
    .single();

  if (chatroomError) {
    throw new Error(`Failed to create chatroom: ${chatroomError.message}`);
  }

  // Get the user's classroom member ID
  const { data: memberData, error: memberError } = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("user_id", user.id)
    .eq("classroom_id", classroom_id)
    .single();

  if (memberError) {
    throw new Error(`Failed to get member ID: ${memberError.message}`);
  }

  // Add the user to the chatroom
  const { error: chatMemberError } = await supabase
    .from("Chatroom_Members")
    .insert([
      {
        chatroom_id: chatroomData.id,
        member_id: memberData.id,
      },
    ]);

  if (chatMemberError) {
    throw new Error(
      `Failed to add user to chatroom: ${chatMemberError.message}`
    );
  }

  revalidatePath("/chatrooms");
};

export const deleteChatroom = async (chatroomId: string) => {
  const supabase = await createClient();

  const { error: chatroomError } = await supabase
    .from("Chatrooms")
    .delete()
    .eq("id", chatroomId);

  if (chatroomError) {
    throw new Error(`Failed to delete chatroom: ${chatroomError.message}`);
  }

  const { error: chatroomMemberError } = await supabase
    .from("Chatroom_Members")
    .delete()
    .eq("chatroom_id", chatroomId);

  if (chatroomMemberError) {
    throw new Error(
      `Failed to delete chatroom members: ${chatroomMemberError.message}`
    );
  }

  revalidatePath("/chatrooms");
};

// export const sendMessageToChatroom = () => {
//   // TODO: Implement this function
// };
//

export const inviteUserToChatroom = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No authenticated user found");
  }

  const chatroomId = formData.get("chatroom_id") as string;
  const inviteeEmail = formData.get("email") as string;

  if (!chatroomId || !inviteeEmail) {
    throw new Error("Chatroom ID and invitee email are required");
  }

  // Get the chatroom to find its classroom_id
  const { data: chatroom, error: chatroomError } = await supabase
    .from("Chatrooms")
    .select("classroom_id")
    .eq("id", chatroomId)
    .single();

  if (chatroomError) {
    throw new Error(`Failed to find chatroom: ${chatroomError.message}`);
  }

  // Find the invitee user by email
  const { data: inviteeUser, error: userError } = await supabase
    .from("Users")
    .select("id")
    .eq("email", inviteeEmail.trim())
    .single();

  if (userError) {
    throw new Error(`Failed to find user with email ${inviteeEmail}`);
  }

  if (!inviteeUser) {
    throw new Error(`No user found with email ${inviteeEmail}`);
  }

  // Check if the invitee is already a member of the classroom
  const { data: existingClassroomMember, error: memberCheckError } =
    await supabase
      .from("Classroom_Members")
      .select("id")
      .eq("classroom_id", chatroom.classroom_id)
      .eq("user_id", inviteeUser.id)
      .maybeSingle();

  if (memberCheckError) {
    throw new Error(
      `Failed to check classroom membership: ${memberCheckError.message}`
    );
  }

  // If not a classroom member, the member cannot be invited
  if (!existingClassroomMember) {
    throw new Error(
      `Invitee is not in the classroom associates with this chatroom`
    );
  }

  const classroomMemberId = existingClassroomMember.id;

  // Check if the user is already a member of the chatroom
  const { data: existingChatroomMember } = await supabase
    .from("Chatroom_Members")
    .select("id")
    .eq("chatroom_id", chatroomId)
    .eq("member_id", classroomMemberId)
    .maybeSingle();

  // If already a member of the chatrrom, cannot invite the invitee
  if (existingChatroomMember) {
    throw new Error(`Invitee is already in the chatroom`);
  }

  // Add the user to the chatroom
  const { error: addChatroomMemberError } = await supabase
    .from("Chatroom_Members")
    .insert([
      {
        chatroom_id: chatroomId,
        member_id: classroomMemberId,
      },
    ]);

  if (addChatroomMemberError) {
    throw new Error(
      `Failed to add user to chatroom: ${addChatroomMemberError.message}`
    );
  }

  revalidatePath("/chatrooms");
  return {
    success: true,
    message: `Successfully invited ${inviteeEmail} to the chatroom`,
  };
};

export const leaveChatroom = async (
  chatroomId: string,
  classroomId: number
) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No authenticated user found");
  }

  // Get user classroom member id
  const { data: classroomMember, error: classroomMemberError } = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("user_id", user.id)
    .eq("classroom_id", classroomId)
    .single();

  if (classroomMemberError) {
    throw new Error(
      `Failed to find classroom membership: ${classroomMemberError.message}`
    );
  }

  // Get the chatroom membership
  const { data: memberData, error: memberError } = await supabase
    .from("Chatroom_Members")
    .select("id")
    .eq("chatroom_id", chatroomId)
    .eq("member_id", classroomMember?.id)
    .single();

  if (memberError) {
    throw new Error(
      `Failed to find chatroom membership: ${memberError.message}`
    );
  }

  // Delete the membership
  const { error: deleteError } = await supabase
    .from("Chatroom_Members")
    .delete()
    .eq("id", memberData.id);

  if (deleteError) {
    throw new Error(`Failed to leave chatroom: ${deleteError.message}`);
  }

  revalidatePath("/chatrooms");
};
