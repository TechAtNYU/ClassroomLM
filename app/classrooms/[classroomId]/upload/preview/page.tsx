import { downloadDocument } from "@/shared/lib/ragflow/dataset-client";
import { notFound } from "next/navigation";

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ documentId: string; datasetId: string }>;
}) {
  const { documentId, datasetId } = await searchParams;

  const { ragflowCallSuccess, content, mimeType, fileName } =
    await downloadDocument(datasetId, documentId);

  if (!ragflowCallSuccess) {
    notFound();
  }

  console.log(`Rendering file: ${fileName}, with MIME type: ${mimeType}`);

  if (mimeType === "application/octet-stream") {
    // We fallback to rendering as text
    const text = new TextDecoder().decode(new Uint8Array(content));
    return (
      <div className="mx-auto h-screen w-4/5">
        <pre className="overflow-auto whitespace-pre-wrap p-4">{text}</pre>
      </div>
    );
  } else {
    // Convert binary content to base64 for embedding non-text file types
    // Allows us to render PDFs, images and other binary formats directly in the browser
    const base64Content = Buffer.from(content).toString("base64");
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
