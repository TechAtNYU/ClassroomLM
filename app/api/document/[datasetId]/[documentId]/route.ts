import { NextRequest, NextResponse } from "next/server";

const RAGFLOW_API_KEY: string = process.env.RAGFLOW_API_KEY || "";
const RAGFLOW_SERVER_URL: string = "https://ragflow.dev.techatnyu.org";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ datasetId: string; documentId: string }> }
) {
  const { datasetId, documentId } = await params;

  const response = await fetch(
    `${RAGFLOW_SERVER_URL}/api/v1/datasets/${datasetId}/documents/${documentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
      },
    }
  );
  // return response;
  if (!response.ok) {
    return NextResponse.json(
      { error: "RAGFlow server error" },
      { status: response.status }
    );
  }

  const data = await response.arrayBuffer();
  // TODO: Right now we are hard-coding a pdf file type. Unfortunately the RAGFlow API only returns
  // Content-Type: 'application/octet-stream'. We will probably have to regex find the file name/extension
  // and map it to its MIME type (like 'application/pdf')
  // List supported by RAGFlow: PDF, DOC, DOCX, TXT, MD, CSV, XLSX, XLS, JPEG, JPG, PNG, TIF, GIF, PPT, PPTX
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline",
    },
  });
}
