"use server";

import { createClient } from "@shared/utils/supabase/server";
import {
  ChatClientWithSession,
  createChatClient,
  sendMessage,
} from "@shared/lib/ragflow/chat/chat-client";

import { getUserAndClassroomData } from "@shared/lib/userContext/contextFetcher";

import { AugmentConfigTemplate } from "@shared/lib/ragflow/chat/chat-configs";

// import { revalidatePath } from "next/cache";
// import {
//   ChatClientWithSession,
//   createChatClient,
//   deleteSession,
//   sendMessage,
// } from "@shared/lib/ragflow/chat/chat-client";
// import { createDatasetClient } from "@shared/lib/ragflow/dataset-client";

export async function createNotesClient(classroomId: string) {
  //create a session for that set of notes

  //first get the dataset ID
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("Classrooms")
    .select()
    .eq("id", Number(classroomId))
    .single();

  if (error) {
    console.error("Error fetching classroom data:", error);
    throw new Error("Error fetching classroom data");
  }

  const datasetId: string = data?.ragflow_dataset_id || "";

  // console.log("datasetId", datasetId);
  // console.log("classroomId", classroomId);

  // const params = { dataset_ids: [datasetId], name: datasetId };

  // const res = await fetch(`${process.env.RAGFLOW_API_URL}/v1/chats`, {
  //   method: "POST", // or 'PUT'
  //   headers: {
  //     Authorization: `Bearer ${process.env.RAGFLOW_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify(params),
  // });

  // console.log("res", res);

  const userAndClassData = await getUserAndClassroomData();

  const resClient = await createChatClient(
    {
      ...AugmentConfigTemplate,
      associatedClassroomName: "Classroom",
      primaryKeyValuesAssistant: [{ key: "id", value: classroomId }],
      primaryKeyValuesSession: [
        { key: "classroom_id", value: classroomId },
        { key: "user_id", value: userAndClassData?.userData.id },
      ],
      datasets: [datasetId],
    }
    // classroomInfo.chat_assistant_id
  );

  if (!resClient.client) {
    console.error("Client is null");
    throw new Error("Invalid chat client instance");
  }

  if (!("sessionId" in resClient.client)) {
    console.error("Client not of correct type");
    throw new Error("Invalid chat client instance: Missing sessionId");
  }
  const chatClient: ChatClientWithSession = resClient.client;

  // console.log(
  //   "chatClient",
  //   chatClient.clientConfig.modelSettings.promptSettings
  // );

  // console.log("datasetId", datasetId);

  return chatClient;
}

export async function reviseNotesLine(
  chatClient: ChatClientWithSession,
  passedLine: string
) {
  const passMessage: string = `Below is a line of text notes taken by a student.
  Please augment these notes with you comments and revise them primarily based on accuracy.
  Only change the parts you want to revise.
  Do not rewrite the notes, simply make small edits for correctness.
  Do not make style and diction revisions.
  Return the notes exactly as given if they are already correct.
  If they notes are accurate, leave them exactly as is.
  Also, please do not use any markdown formatting.
  ${passedLine}
`;

  const messageResponse = await sendMessage(chatClient, passMessage);

  if (!messageResponse.ragflowCallSuccess) {
    console.error("Error sending message");
    throw new Error("Error sending message");
  }

  const revisedNotes: string = messageResponse.response
    .replace("Notes: ", "")
    .replaceAll("##0$$\n", "");
  // console.log("revisedNotes", revisedNotes);

  const reason: string = await getAugmentReason(
    chatClient,
    passedLine,
    revisedNotes
  );

  return [revisedNotes, reason];
}

export async function getAugmentReason(
  chatClient: ChatClientWithSession,
  originalNotes: string,
  augmentedNotes: string
) {
  const passMessage: string = `In a previous message, you augmented the following notes:
  "${originalNotes}"
  to
  "${augmentedNotes}"

  Can you explain why you made this change?
  Please do not use any markdown formatting in your response.
`;

  const messageResponse = await sendMessage(chatClient, passMessage);

  if (!messageResponse.ragflowCallSuccess) {
    console.error("Error getting explanation");
    throw new Error("Error getting explanation");
  }

  return messageResponse.response;
}
