import { getCurrentUserId, getRagflowDatasetId } from "./actions";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const userId = await getCurrentUserId();
  const { classroomId } = await params;
  const datasetId = getRagflowDatasetId(Number(classroomId));

  return (
    <div className="p-4 text-gray-800 dark:text-white">
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
