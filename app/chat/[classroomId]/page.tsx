import {
  getCurrentUserId,
  getRagflowDatasetId,
  getOrCreateAssistant,
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

  const chatAssistant = await getOrCreateAssistant(datasetId, userId);

  // console.log("chatAssistant", chatAssistant);
  return (
    <div className="p-4 text-gray-800 dark:text-white">
      <p>
        <strong>Classroom ID:</strong> {classroomId}, <strong>User ID:</strong>{" "}
        {userId}, <strong>Ragflow Dataset ID:</strong> {datasetId},{" "}
        <strong>Chat Assistant ID:</strong> {chatAssistant}
      </p>

      <MessageBox assistantID={chatAssistant}></MessageBox>
    </div>
  );
}
