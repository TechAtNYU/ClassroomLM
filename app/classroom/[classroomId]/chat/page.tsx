import Link from "next/link";

import MessageBox from "./MessageBox";
import { createDatasetClient } from "@shared/lib/ragflow/dataset-client";
import { getUserAndClassroomData } from "@shared/lib/userContext/contextFetcher";
import {
  ChatClientWithSession,
  createChatClient,
} from "@shared/lib/ragflow/chat/chat-client";
import { personalChatConfigTemplate } from "@shared/lib/ragflow/chat/chat-configs";
import { Button } from "@shared/components/ui/button";
import { Upload } from "lucide-react";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  // Get user and class data in order to get the classroom name, at different points error out if the calls arent successful
  const userAndClassData = await getUserAndClassroomData();
  if (!userAndClassData) {
    console.log(
      "Error rendering chat page, error fetching user and classroom info."
    );
    return (
      // TODO: make server error page
      <h1> server error </h1>
    );
  }
  const { classroomId } = await params;
  const classroomIdNum = Number(classroomId);
  const user = userAndClassData.userData;
  const username = user.user_metadata?.full_name ?? "User Name";

  const classroomInfo = userAndClassData.classroomsData.find(
    (x) => x.id === classroomIdNum
  );
  if (!classroomInfo) {
    console.log(
      "Error rendering chat page, supabase call successful but classroom not found"
    );
    return (
      // TODO: make 404 page since this is a classroom not found
      <h1> 404 </h1>
    );
  }

  // Now that we know we have a valid classroom, we create the dataset client. Creating the client
  // ensures that we have a valid RagFlow dataset (it will make it if one doesn't already exist
  // or the currently stored ID refers to an invalid dataset) and that this is properly reflected in Supabase
  const datasetClient = await createDatasetClient(
    {
      classroomId,
      classroomName: classroomInfo.name ?? "Classroom", //TODO: make class name non-nullable in supabase
    },
    classroomInfo.ragflow_dataset_id
  );

  if (!datasetClient) {
    console.log(
      "Error rendering chat page, error creating or fetching dataset for classroom."
    );
    return (
      // TODO: make server error page
      <h1> server error </h1>
    );
  }

  const chatClient = await createChatClient(
    {
      ...personalChatConfigTemplate,
      associatedClassroomName: classroomInfo.name ?? "Classroom",
      primaryKeyValuesAssistant: [{ key: "id", value: classroomInfo.id }],
      primaryKeyValuesSession: [
        { key: "classroom_id", value: classroomInfo.id },
        { key: "user_id", value: user.id },
      ],
      datasets: [datasetClient.client.datasetId],
    }
    // classroomInfo.chat_assistant_id
  );

  if (!chatClient.client) {
    if (chatClient.failBecauseDatasetEmpty) {
      return user.id === classroomInfo.admin_user_id ? (
        <div className="flex gap-4">
          <h1>Empty dataset, go upload files for classroom: </h1>
          <Button
            type="button"
            // variant={"ghost"}
            // size={"iconLg"}
            asChild
          >
            <Link href={`./upload`} passHref>
              <Upload className="scale-[200%]" />
            </Link>
          </Button>
        </div>
      ) : (
        <h1>
          Classroom dataset empty, please ask your instructor to add some
          resources!
        </h1>
      );
    }
    return <h1>Server error! </h1>; //TODO fixthis
  }
  // console.log(chatClient);

  // const chatAssistantId = await getOrCreateAssistant(
  //   Number(classroomId),
  //   datasetId
  // );
  // if (chatAssistantId.status == "empty") {
  //   return (
  //     <>
  //       <h1>Classroom dataset empty!</h1>
  //       <Link href="/classroom">
  //         <button className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900">
  //           Back to My Classrooms
  //         </button>
  //       </Link>
  //     </>
  //   );
  // }
  // const chatSessionId = await getOrCreateSession(
  //   userId,
  //   chatAssistantId.id,
  //   classroomIdNum
  // );

  // const messageHistory = await retrieveMessageHistory(
  //   chatAssistantId.id,
  //   userId,
  //   chatSessionId
  // );

  // const displayInfo = await getDisplayInfo(classroomIdNum, userId);

  // // console.log("chatAssistant", chatAssistant);
  return (
    <div className="p-4 text-gray-800 dark:text-white">
      {/* <p>
        <strong>Classroom ID: </strong>
        {classroomId}
        <br></br>
        <strong>User ID: </strong>
        {userId} <br></br>
        <strong>Ragflow Dataset ID:</strong> {datasetId} <br></br>
        <strong>Chat Assistant ID:</strong> {chatAssistantId} <br></br>
        <strong>Chat Session ID:</strong> {chatSessionId}
      </p> */}
      <p>
        <strong>Welcome to: </strong>
        {classroomInfo.name}, <strong>{username}</strong> <br />
        <strong>Ragflow Dataset ID:</strong> {datasetClient.client.datasetId}{" "}
        <br />
        <strong>Chat Assistant ID:</strong> {chatClient.client.assistantId}{" "}
        <br />
        <strong>Chat Session ID:</strong>{" "}
        {(chatClient.client as ChatClientWithSession).sessionId}
      </p>

      <MessageBox
        chatClient={chatClient.client as ChatClientWithSession}
        messageHistory={chatClient.messageHistory}
      />
    </div>
  );
}
