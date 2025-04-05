"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import {
  ChatClientWithSession,
  createChatClient,
  deleteSession,
  sendMessage,
} from "../lib/ragflow/chat/chat-client";
import { ClassroomWithMembers } from "../lib/userContext/contextFetcher";
import { createDatasetClient } from "../lib/ragflow/dataset-client";
import { chatroomConfigTemplate } from "../lib/ragflow/chat/chat-configs";

export const createChatroom = async (formData: FormData) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Unauthenticated user on chatroom page");
    return; // {supabaseCallSuccess: false}
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
    console.error(`Failed to create chatroom: ${chatroomError.message}`);
    return; // {supabaseCallSuccess: false}
  }

  // Get the user's classroom member ID
  const { data: memberData, error: memberError } = await supabase
    .from("Classroom_Members")
    .select("id")
    .eq("user_id", user.id)
    .eq("classroom_id", classroom_id)
    .single();

  if (memberError) {
    console.error(`Failed to get member ID: ${memberError.message}`);
    return; //{supabaseCallSuccess: false}
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
    console.error(`Failed to add user to chatroom: ${chatMemberError.message}`);
    return; //{supabaseCallSuccess: false}
  }
  revalidatePath("/chatrooms");
  return; //{supabaseCallSuccess: true}
};

export const deleteChatroom = async (
  chatroomId: string,
  classroomId: number,
  chatroomAssistantId: string | null
) => {
  const supabase = await createClient();

  // const assistantId = await findChatAssistant(classroomId, chatroomId);

  if (chatroomAssistantId) {
    // console.log("found session. delete session for chatroom");
    await deleteSession(chatroomAssistantId, {
      primaryKeyValuesSessions: [{ key: "id", value: chatroomId }],
      sessionIdStorage: chatroomConfigTemplate.sessionIdStorage,
    });
  }

  const { error: chatroomError } = await supabase
    .from("Chatrooms")
    .delete()
    .eq("id", chatroomId);

  if (chatroomError) {
    console.error(`Failed to delete chatroom: ${chatroomError.message}`);
  }

  revalidatePath("/chatrooms");
};

// export const sendMessageToChatroom = async (formData: FormData) => {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     throw new Error("No authenticated user found");
//   }

//   const chatroomId = formData.get("chatroomId") as string;
//   let content = (formData.get("message") as string).trim();
//   const chatroomMemberId = parseInt(formData.get("chatroomMemberId") as string);

//   if (!content || !chatroomMemberId || !chatroomId) {
//     throw new Error(
//       "Chatroom ID, chatroom member ID, and message content are required"
//     );
//   }

//   // Check if the message starts with "/ask" and trim it
//   const isAskCommand = content.startsWith("/ask ");
//   if (isAskCommand) {
//     content = content.substring(5).trim();
//     if (!content) {
//       throw new Error("Message content is required after the /ask command");
//     }
//   }

//   // Insert the message
//   const { error: messageError } = await supabase.from("Messages").insert([
//     {
//       content,
//       member_id: chatroomMemberId,
//       chatroom_id: chatroomId,
//       is_ask: isAskCommand,
//     },
//   ]);

//   if (messageError) {
//     throw new Error(`Failed to send message: ${messageError.message}`);
//   }

//   // Handle user "/ask" command
//   if (isAskCommand) {
//     askLLM(chatroomId);
//   }

//   revalidatePath(`/chatrooms/${chatroomId}`);
// };

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
      Classrooms(
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
      .eq("classroom_id", chatroom.Classrooms.id);

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
          is_active: true,
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

export const askLLM = async (
  classroomInfo: ClassroomWithMembers,
  chatroomId: string,
  client: ChatClientWithSession | null
): Promise<{
  client: ChatClientWithSession | null;
  supabaseMessageFetch: boolean;
  datasetClientCreationSuccess: boolean;
  failedBecauseEmptyDataset: boolean;
  clientCreationSuccess: boolean;
  llmMessageSend: boolean;
}> => {
  const supabase = await createClient();

  // const { data: chatroom, error: chatroomError } = await supabase
  //   .from("Chatrooms")
  //   .select("classroom_id")
  //   .eq("id", chatroomId)
  //   .single();

  // if (chatroomError) {
  //   throw new Error(`Failed to find chatroom: ${chatroomError.message}`);
  // }

  // get all messages that is new
  const { data: messageRaw, error: messagesError } = await supabase
    .from("Messages")
    .select(
      `
      *,
      Chatroom_Members!inner (
        Classroom_Members (
          Users (
            full_name
          )
        )
      )
    `
    )
    .eq("is_new", true)
    .eq("chatroom_id", chatroomId)
    .eq("Chatroom_Members.is_active", true)
    .order("created_at", { ascending: true });

  if (messagesError || !messageRaw) {
    console.error("Error fetching messages:", messagesError);
    return {
      client: null,
      supabaseMessageFetch: false,
      datasetClientCreationSuccess: false,
      failedBecauseEmptyDataset: false,
      clientCreationSuccess: false,
      llmMessageSend: false,
    };
  }

  const messages = messageRaw.map((message) => {
    const { Chatroom_Members, ...newMessage } = message;
    return {
      id: newMessage.id,
      created_at: newMessage.created_at,
      content: newMessage.content,
      is_ask: newMessage.is_ask,
      full_name:
        Chatroom_Members?.Classroom_Members.Users.full_name || "Unknown User",
    };
  });

  // HACK: We might need better prompt engineering at some point to optomize performance
  const prompt = `
    Below is the chat history before your last response (if any) in JSON:

    ${JSON.stringify(messages)}
      `;

  // If no client already provided, make a new one
  if (!client) {
    // First we create the dataset client
    const datasetClient = await createDatasetClient(
      {
        classroomId: classroomInfo.id.toString(),
        classroomName: classroomInfo.name ?? "Classroom", //TODO: make class name non-nullable in supabase
      },
      classroomInfo.ragflow_dataset_id
    );

    if (!datasetClient) {
      console.log(
        "Error rendering chat page, error creating or fetching dataset for classroom."
      );
      return {
        client: null,
        supabaseMessageFetch: true,
        datasetClientCreationSuccess: false,
        failedBecauseEmptyDataset: false,
        clientCreationSuccess: false,
        llmMessageSend: false,
      };
    }
    // Then create the chat client using the chatroom specific template
    const createClientResponse = await createChatClient(
      {
        ...chatroomConfigTemplate,
        associatedClassroomName: classroomInfo.name ?? "Classroom",
        primaryKeyValuesAssistant: [{ key: "id", value: classroomInfo.id }],
        primaryKeyValuesSession: [{ key: "id", value: chatroomId }],
        datasets: [datasetClient.client.datasetId],
      }
      // classroomInfo.chat_assistant_id
    );

    if (!createClientResponse.client) {
      if (createClientResponse.failBecauseDatasetEmpty) {
        llmToChatroom(
          chatroomId,
          "The dataset is empty right now, please ask your instructor to add materials to this classroom's dataset!"
        );
        return {
          client: null,
          supabaseMessageFetch: true,
          datasetClientCreationSuccess: true,
          failedBecauseEmptyDataset: true,
          clientCreationSuccess: false,
          llmMessageSend: false,
        };
      }
      return {
        client: null,
        supabaseMessageFetch: true,
        datasetClientCreationSuccess: true,
        failedBecauseEmptyDataset: false,
        clientCreationSuccess: false,
        llmMessageSend: false,
      };
    }

    client = createClientResponse.client as ChatClientWithSession;
  }

  // const datasetId = await getRagflowDatasetId(chatroom.classroom_id);

  // if (!datasetId) {
  //   llmToChatroom(chatroomId, "No dataset found!");
  //   return;
  // }

  // const assistant = await getOrCreateAssistant(
  //   chatroomId,
  //   datasetId,
  //   chatroom.classroom_id
  // );

  // if (!assistant.id) {
  //   llmToChatroom(chatroomId, "Dataset is empty");
  //   return;
  // }

  // const chatSessionId = await getOrCreateSession(
  //   chatroomId,
  //   assistant.id,
  //   chatroom.classroom_id
  // );

  const messageResponse = await sendMessage(client, prompt);

  if (!messageResponse.ragflowCallSuccess) {
    return {
      client: null,
      supabaseMessageFetch: true,
      datasetClientCreationSuccess: true,
      failedBecauseEmptyDataset: false,
      clientCreationSuccess: false,
      llmMessageSend: false,
    };
  }

  // const response: string = await sendMessage(
  //   prompt,
  //   assistant.id,
  //   chatSessionId
  // );

  llmToChatroom(chatroomId, messageResponse.response);

  // mark all messages as not new message
  const messageIds = messages.map((message) => message.id);
  // console.log(messageIds);

  const { error: messageMarkError } = await supabase
    .from("Messages")
    .update({ is_new: false })
    .in("id", messageIds);

  if (messageMarkError) {
    console.error(
      `Error setting message as not new and sent to the LLM for chatroom ID ${chatroomId}:`,
      messageMarkError
    );
  }
  return {
    client: client,
    supabaseMessageFetch: true,
    datasetClientCreationSuccess: true,
    failedBecauseEmptyDataset: false,
    clientCreationSuccess: true,
    llmMessageSend: true,
  };
};

const llmToChatroom = async (chatroomId: string, message: string) => {
  const supabase = await createClient();

  const { error } = await supabase.from("Messages").insert([
    {
      chatroom_id: chatroomId,
      content: message,
      is_new: false,
    },
  ]);

  if (error) {
    console.error(
      `Error while sending message from LLM to chatroom ${chatroomId}:`,
      error
    );
  }
};
