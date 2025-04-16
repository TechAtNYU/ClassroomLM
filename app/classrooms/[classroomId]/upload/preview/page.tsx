import {
  createDatasetClient,
  downloadDocument,
} from "@/shared/lib/ragflow/dataset-client";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ documentId: string; datasetId: string }>;
}) {
  const { documentId, datasetId } = await searchParams;

  // Create a temporary client to access the dataset
  const datasetClientResult = await createDatasetClient(
    {
      classroomId: "0", // We don't actually need a real classroom ID for preview
      classroomName: "preview",
    },
    datasetId
  );

  if (!datasetClientResult) {
    return <>Unable to access document. Please try refreshing.</>;
  }

  const { content, mimeType, fileName } = await downloadDocument(
    datasetClientResult.client,
    documentId
  );
  console.log(`Rendering file: ${fileName}, with MIME type: ${mimeType}`);

  if (mimeType === "application/octet-stream") {
    // For text content, decode the ArrayBuffer using TextDecoder
    const text = new TextDecoder().decode(new Uint8Array(content));
    return (
      <div className="mx-auto h-screen w-4/5">
        <pre className="overflow-auto whitespace-pre-wrap p-4">{text}</pre>
      </div>
    );
  } else {
    // Convert binary content to base64 for embedding non-text file types
    // Allows us to render PDFs, images and other binary formats directly in the browser
    const binaryString = Array.from(new Uint8Array(content))
      .map((byte) => String.fromCharCode(byte))
      .join("");
    const base64Content = btoa(binaryString);
    return (
      <div className="mx-auto h-screen w-4/5">
        <embed
          src={`data:${mimeType};base64,${base64Content}`}
          width="100%"
          height="100%"
        />
      </div>
    );
  }
}
