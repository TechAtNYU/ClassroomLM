import { UUID } from "crypto";
import {
  getCurrentUserId,
  getRagflowDatasetId,
  getOrCreateAssistant,
  getOrCreateSession,
} from "./actions";

export default async function Home({
  params,
}: {
  params: { classroomId: number };
}) {
  const userID = await getCurrentUserId();
  const classroomID = await params.classroomId;
  const datasetID = await getRagflowDatasetId(classroomID);
  const assistantID = await getOrCreateAssistant(datasetID);
  const sessionID = await getOrCreateSession(userID, assistantID.id);
  //console.log(sessionID);
  const message = sessionID.messages;
  console.log(message);
  //const sessionIDResponse = getChatSession(userID, classroomID);

  return (
    <div className="p-4 text-white">
      <p>
        <strong>Classroom ID:</strong> {classroomID}
      </p>
      <p>
        <strong>User ID:</strong> {userID}
      </p>
      <p>
        <strong>Ragflow Dataset ID:</strong> {datasetID}
      </p>
      <p>
        <strong>Assistant ID:</strong> {assistantID.id}
      </p>
      <p>
        <strong>Session ID:</strong> {sessionID.id}
      </p>
      <div className="min-h-screen bg-gray-100 p-4">
        {message.map((msg) => (
          <div
            key={msg.id}
            className={`my-2 max-w-md rounded-lg p-3 shadow-md ${
              msg.role === "assistant"
                ? "self-start bg-blue-200"
                : "self-end bg-green-200"
            }`}
          >
            <p className="font-medium text-gray-800">{msg.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
