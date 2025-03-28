export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ documentId: string; datasetId: string }>;
}) {
  const { documentId, datasetId } = await searchParams;

  return (
    <div className="h-screen w-screen">
      <embed
        src={`/api/document/${datasetId}/${documentId}`}
        width="100%"
        height="100%"
      />
    </div>
  );
}
