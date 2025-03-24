import Link from "next/link";
import {
  getCurrentUserId,
  getRagflowDatasetId,
  getOrCreateAssistant,
  getOrCreateSession,
  getDisplayInfo,
  retrieveMessageHistory,
} from "./actions";

import MessageBox from "./MessageBox";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const userId = await getCurrentUserId();
  const { classroomId } = await params;
  const classroomIdNum = Number(classroomId);
  const datasetId = await getRagflowDatasetId(classroomIdNum);

  if (!datasetId) {
    return <h1>No dataset found!</h1>;
  }

  const chatAssistantId = await getOrCreateAssistant(
    Number(classroomId),
    datasetId
  );
  if (chatAssistantId.status == "empty") {
    return (
      <>
        <h1>Classroom dataset empty!</h1>
        <Link href="/classroom">
          <button className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-red-300 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900">
            Back to My Classrooms
          </button>
        </Link>
      </>
    );
  }
  const chatSessionId = await getOrCreateSession(
    userId,
    chatAssistantId.id,
    classroomIdNum
  );

  const messageHistory = await retrieveMessageHistory(
    chatAssistantId.id,
    userId,
    chatSessionId
  );

  const displayInfo = await getDisplayInfo(classroomIdNum, userId);

  // console.log("chatAssistant", chatAssistant);
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
        {displayInfo[0]}, <strong>{displayInfo[1]}</strong> <br />
        <strong>Ragflow Dataset ID:</strong> {datasetId} <br />
        <strong>Chat Assistant ID:</strong> {chatAssistantId.id} <br />
        <strong>Chat Session ID:</strong> {chatSessionId}
      </p>{" "}
      {chatAssistantId && chatSessionId && messageHistory && (
        <MessageBox
          assistantId={chatAssistantId.id}
          chatSessionId={chatSessionId}
          messageHistory={messageHistory}
        ></MessageBox>
      )}
    </div>
  );
}
