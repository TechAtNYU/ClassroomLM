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
        creater_user_id: user.id,
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

  revalidatePath("/chatrooms");
};

export const sendMessageToChatroom = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No authenticated user found");
  }

  const chatroomId = formData.get("chatroomId") as string;
  const content = formData.get("message") as string;
  const chatroomMemberId = parseInt(formData.get("chatroomMemberId") as string);

  if (!content || !chatroomMemberId || !chatroomId) {
    throw new Error(
      "Chatroom ID, chatroom member ID, and message content are required"
    );
  }

  // Insert the message
  const { error: messageError } = await supabase.from("Messages").insert([
    {
      content,
      member_id: chatroomMemberId,
    },
  ]);

  if (messageError) {
    throw new Error(`Failed to send message: ${messageError.message}`);
  }

  revalidatePath(`/chatrooms/${chatroomId}`);
};

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

  // Get the chatroom members
  const { data: chatroomMembers, error: chatroomMembersError } = await supabase
    .from("Chatroom_Members")
    .select(
      `
      *,
      Chatrooms!inner(
        id,
        classroom_id
      )
    `
    )
    .eq("Chatrooms.id", chatroomId);

  if (chatroomMembersError) {
    throw new Error(`Failed to find chatroom: ${chatroomMembersError.message}`);
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

  // Get chatroom details
  const { data: chatroom, error: chatroomError } = await supabase
    .from("Chatrooms")
    .select(
      `
      *,
      Classroom(
        id
      )
    `
    )
    .eq("id", chatroomId)
    .single();

  if (chatroomError) {
    throw new Error(`Failed to find chatroom: ${chatroomError.message}`);
  }

  // Get classroom members for the classroom associated with this chatroom
  let classroomMemberId = null;

  const { data: classroomMembers, error: classroomMembersError } =
    await supabase
      .from("Classroom_Members")
      .select("id, user_id")
      .eq("classroom_id", chatroom.Classroom.id);

  if (classroomMembersError) {
    throw new Error(
      `Failed to get classroom members: ${classroomMembersError.message}`
    );
  }

  // Check if the invitee is a member of the classroom. If not cannot invite
  for (const classroomMember of classroomMembers) {
    if (classroomMember.user_id === inviteeUser.id) {
      classroomMemberId = classroomMember.id;
      break;
    }
  }

  // If not a classroom member, the member cannot be invited
  if (!classroomMemberId) {
    throw new Error(
      `Invitee is not in the classroom associated with this chatroom`
    );
  }

  // If already a member of the chatroom, cannot invite the invitee
  const isInChatroom = chatroomMembers.find(
    (member) =>
      member.member_id === classroomMemberId && member.is_active === true
  );

  if (isInChatroom) {
    throw new Error(`Invitee is already in the chatroom`);
  }

  // Check if the user was previously in the chatroom but is now inactive
  const inactiveMember = chatroomMembers.find(
    (member) =>
      member.member_id === classroomMemberId && member.is_active === false
  );

  if (inactiveMember) {
    // Reactivate the member instead of creating a new record
    const { error: updateError } = await supabase
      .from("Chatroom_Members")
      .update({ is_active: true })
      .eq("id", inactiveMember.id);

    if (updateError) {
      throw new Error(
        `Failed to reactivate user in chatroom: ${updateError.message}`
      );
    }
  } else {
    // Add the user to the chatroom
    const { error: addChatroomMemberError } = await supabase
      .from("Chatroom_Members")
      .insert([
        {
          chatroom_id: chatroomId,
          member_id: classroomMemberId,
          is_active: true, // Explicitly set is_active to true
        },
      ]);

    if (addChatroomMemberError) {
      throw new Error(
        `Failed to add user to chatroom: ${addChatroomMemberError.message}`
      );
    }
  }

  revalidatePath("/chatrooms");
  return {
    success: true,
    message: `Successfully invited ${inviteeEmail} to the chatroom`,
  };
};

export const leaveChatroom = async (chatroomId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No authenticated user found");
  }

  // Get the chatroom membership
  const { data: memberData, error: memberError } = await supabase
    .from("Chatroom_Members")
    .select(
      `
      id,
      chatroom_id,
      Classroom_Members!inner (
        user_id
      )
    `
    )
    .eq("chatroom_id", chatroomId)
    .eq("Classroom_Members.user_id", user.id)
    .single();

  if (memberError) {
    throw new Error(
      `Failed to find chatroom membership: ${memberError.message}`
    );
  }

  // Update the membership to set is_active to false instead of deleting
  const { error: updateError } = await supabase
    .from("Chatroom_Members")
    .update({ is_active: false })
    .eq("id", memberData.id);

  if (updateError) {
    throw new Error(`Failed to leave chatroom: ${updateError.message}`);
  }

  revalidatePath("/chatrooms");
};
