import UploadComponent from "./uploadComponent";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = await params;
  return <UploadComponent classroomId={classroomId} />;
}
