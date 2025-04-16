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
import AutogenerateButton from "./AutogenerateButton";
import GeneratedMaterialsSidebar from "./GeneratedMaterialsSidebar";

export default async function ChatPage({
  params,
}: {
  params: { classroomId: string };
}) {
  const userId = await getCurrentUserId();
  const { classroomId } = params;
  const classroomIdNum = Number(classroomId);
  const datasetId = await getRagflowDatasetId(classroomIdNum);

  if (!datasetId) {
    return <h1>No dataset found!</h1>;
  }

  const chatAssistantId = await getOrCreateAssistant(classroomIdNum, datasetId);
  if (chatAssistantId.status === "empty") {
    return (
      <>
        <h1>Classroom dataset empty!</h1>
        <Link href="/classroom">
          <button className="mb-2 me-2 rounded-lg border border-red-700 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-800 hover:text-white">
            Back to My Classrooms
          </button>
        </Link>
      </>
    );
  }

  // For normal chat sessions, use the real userId for both Ragflow and local DB.
  const chatSessionId = await getOrCreateSession(
    userId,
    chatAssistantId.id,
    classroomIdNum,
    userId
  );

  const messageHistory = await retrieveMessageHistory(
    chatAssistantId.id,
    userId,
    chatSessionId
  );
  const displayInfo = await getDisplayInfo(classroomIdNum, userId);

  return (
    <div className="p-4 text-gray-800 dark:text-white">
      <p>
        <strong>Welcome to:</strong> {displayInfo[0]},{" "}
        <strong>{displayInfo[1]}</strong>
        <br />
        <strong>Ragflow Dataset ID:</strong> {datasetId} <br />
        <strong>Chat Assistant ID:</strong> {chatAssistantId.id} <br />
        <strong>Chat Session ID:</strong> {chatSessionId}
      </p>
      {chatAssistantId && chatSessionId && messageHistory && (
        <MessageBox
          assistantId={chatAssistantId.id}
          chatSessionId={chatSessionId}
          messageHistory={messageHistory}
        />
      )}
      <div className="mt-6">
        <AutogenerateButton classroomId={classroomIdNum} />
      </div>
      {/* Include the sidebar to list all sessions for the current chat assistant */}
      <GeneratedMaterialsSidebar
        assistantId={chatAssistantId.id}
        realUserId={userId}
      />
    </div>
  );
}
