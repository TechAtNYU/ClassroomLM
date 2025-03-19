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
    datasetId,
    userId
  );

  const chatSessionId = await getOrCreateSession(
    userId,
    chatAssistantId,
    classroomIdNum
  );

  const messageHistory = await retrieveMessageHistory(
    chatAssistantId,
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
        <strong>Chat Assistant ID:</strong> {chatAssistantId} <br />
        <strong>Chat Session ID:</strong> {chatSessionId}
      </p>{" "}
      <MessageBox
        assistantId={chatAssistantId}
        userId={userId}
        chatSessionId={chatSessionId}
        messageHistory={messageHistory}
      ></MessageBox>
    </div>
  );
}
