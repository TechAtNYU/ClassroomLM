"use server";

const RAGFLOW_API_KEY: string = process.env.NEXT_RAGFLOW_API_KEY || "";
const RAGFLOW_SERVER_URL: string = "https://ragflow.dev.techatnyu.org";

export async function uploadFile(formData: FormData) {
  if (!RAGFLOW_API_KEY) {
    return { success: false, message: "Missing API key", files: [] };
  }

  console.log("Uploading file...", formData);
  const datasetResponse = await listDatasets("upload_documents_test");

  if (!datasetResponse?.data?.length) {
    return { success: false, message: "Dataset not found", files: [] };
  }

  const datasetId = datasetResponse.data[0].id;
  const uploadResult = await uploadDocuments(datasetId, formData);

  console.log("Upload API Response:", uploadResult);

  if (!uploadResult?.data?.length) {
    return { success: false, message: "File upload failed", files: [] };
  }

  const fileId = uploadResult.data[0].id;
  const parseResponse = await parseDocument(datasetId, fileId);
  console.log("Parsing API Response:", parseResponse);

  if (parseResponse.code !== 0) {
    return {
      success: false,
      message: "File uploaded but parsing failed",
      files: [],
    };
  }

  return await listDocuments(datasetId);
}

export async function listDocuments(datasetId: string) {
  const response = await fetch(
    `${RAGFLOW_SERVER_URL}/api/v1/datasets/${datasetId}/documents?page=1&page_size=30&orderby=create_time&desc=true`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();
  console.log("Fetched documents:", result);

  if (result.code !== 0) {
    return {
      success: false,
      message: "Failed to retrieve documents",
      files: [],
    };
  }

  type DocumentFile = {
    id: string;
    datasetId: string;
    name: string;
    size: number;
    type: string;
    run?: string;
    status: string;
  };

  const filesList: DocumentFile[] = result.data.docs.map(
    (file: DocumentFile) => ({
      id: file.id,
      datasetId: datasetId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: file.run !== undefined ? file.run : "PENDING",
    })
  );

  return { success: true, files: filesList };
}

export async function parseDocument(datasetId: string, fileId: string) {
  const response = await fetch(
    `${RAGFLOW_SERVER_URL}/api/v1/datasets/${datasetId}/chunks`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ document_ids: [fileId] }),
    }
  );

  const result = await response.json();
  console.log("Parse Document Response:", result);

  return result;
}

export async function stopParsingDocument(datasetId: string, fileId: string) {
  const response = await fetch(
    `${RAGFLOW_SERVER_URL}/api/v1/datasets/${datasetId}/chunks`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ document_ids: [fileId] }),
    }
  );

  const result = await response.json();
  console.log("Stop Parsing Response:", result);

  return result;
}

export async function deleteDocument(datasetId: string, fileId: string) {
  const response = await fetch(
    `${RAGFLOW_SERVER_URL}/api/v1/datasets/${datasetId}/documents`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids: [fileId] }),
    }
  );

  const result = await response.json();
  console.log("Delete Document Response:", result);

  return result;
}

// ====================================================
// Helper functions for Dataset and Uploading
// ====================================================

async function listDatasets(name: string) {
  const params = new URLSearchParams({ name });
  const response = await fetch(
    `${RAGFLOW_SERVER_URL}/api/v1/datasets?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
      },
    }
  );
  return await response.json();
}

async function uploadDocuments(datasetId: string, formData: FormData) {
  const response = await fetch(
    `${RAGFLOW_SERVER_URL}/api/v1/datasets/${datasetId}/documents`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RAGFLOW_API_KEY}`,
      },
      body: formData,
    }
  );
  return await response.json();
}
