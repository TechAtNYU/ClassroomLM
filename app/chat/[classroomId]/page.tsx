import {
  getCurrentUserId,
  getRagflowDatasetId,
  getOrCreateAssistant,
  getOrCreateSession,
  getDisplayInfo,
} from "./actions";

import MessageBox from "./MessageBox";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const userId = await getCurrentUserId();
  const { classroomId } = await params;
  const datasetId = await getRagflowDatasetId(Number(classroomId));

  const chatAssistantId = await getOrCreateAssistant(
    classroomId,
    datasetId,
    userId
  );

  const chatSessionId = await getOrCreateSession(
    userId,
    chatAssistantId,
    classroomId
  );

  const displayInfo = await getDisplayInfo(classroomId, userId);

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
        {displayInfo[0]}, <strong>{displayInfo[1]}</strong>
      </p>{" "}
      <MessageBox
        assistantId={chatAssistantId}
        userId={userId}
        chatSessionId={chatSessionId}
      ></MessageBox>
    </div>
  );
}
