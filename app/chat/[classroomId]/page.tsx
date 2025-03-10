import { getCurrentUserId, getRagflowDatasetId } from "./actions";

export default async function ChatPage({
  params,
}: {
  params: { classroomId: string };
}) {
  const userId = await getCurrentUserId();
  const classroomId = decodeURI(params.classroomId);
  const datasetId = getRagflowDatasetId(classroomId);

  return (
    <div className="p-4 text-white">
      <p>
        <strong>Classroom ID:</strong> {classroomId}
      </p>
      <p>
        <strong>User ID:</strong> {userId}
      </p>
      <p>
        <strong>Ragflow Dataset ID:</strong> {datasetId}
      </p>
    </div>
  );
}
