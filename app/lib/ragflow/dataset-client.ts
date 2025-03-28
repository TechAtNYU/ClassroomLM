"use server"
import { isUserAdminForClassroom } from "@/app/upload/[classroomId]/actions";
import { createServiceClient } from "@/utils/supabase/service-server";

export type DatasetClassroomConfig = {
  classroomId: string;
  classroomName: string;
};

export type DatasetClient = {
  classroomConfig: DatasetClassroomConfig;
  datasetId: string;
};

type DocumentFile = {
  id: string;
  datasetId: string;
  name: string;
  size: number;
  type: string;
  run?: string;
  status: string;
};

/**
 * Result from any operation that changes the client itself
 *
 * **MAKE SURE TO SET YOUR CLIENT TO THE RETURNED CLIENT HERE**
 */
type DatasetMutableOperationResult = {
  client: DatasetClient;
};

// Might change later with
type DatasetReadOnlyOperationResult = object;

// Based off @supabase\supabase-js\src\SupabaseClient.ts
// class DatasetClient {
//     protected datasetUrl: string
//     protected requestHeader: {"Authorization": string, "Content-Type": string;}
//     protected classroomId: string;
//     protected classroomName: string;
//     protected datasetId!: string; // Definite assertion (!) is because constructor is not publicly available, must use createAssociatedDataset()

//     constructor (ragflowUrl: string, ragflowKey: string, classroomConfig: DatasetClassroomConfig){
//         this.datasetUrl = `${stripTrailingSlash(ragflowUrl)}/api/v1/datasets`
//         this.requestHeader = {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${ragflowKey}`,
//           };
//         this.classroomId = classroomConfig.classroomId;
//         this.classroomName = classroomConfig.classroomName;
//     }

//     public async verifyDatasetExistence(){
//         const params = new URLSearchParams({id: this.datasetId});
//         const response = await fetch(
//           `${getDatasetUrl()}?${params.toString()}`,
//           {
//             method: "GET",
//             headers: getHeader()
//           }
//         );
//         const jsonData = await response.json();
//         if (!response.ok){
//             console.error("DatasetService, verify dataset exist, Ragflow fetch error:", jsonData);
//             return {fetchSuccess: false, doesExist: undefined}
//         }
//         if (!jsonData?.data?.length) {
//             return {fetchSuccess: true, doesExist: false}
//         }
//         return {fetchSuccess: true, doesExist: true};
//     }

//     public async createAssociatedDataset(classroomName: string){
//         const timestamp = Date.now();
//         const datasetName = `${classroomName}_${timestamp}_${this.classroomId.substring(0, 6)}`;
//         const ragflowResponse = await fetch(this.datasetUrl, {
//           method: "POST",
//           headers: this.requestHeader,
//           body: JSON.stringify({
//             name: datasetName,
//           }),
//         });

//         const ragflowResponseData = await ragflowResponse.json();
//         if (!ragflowResponse.ok) {
//           console.error("DatasetService, creating dataset in RAGFlow:", ragflowResponseData);
//           return {fetchSuccess: false};
//         }

//         const ragflowDatasetId = ragflowResponseData.data.id;

//         const supabase = await createServiceClient();
//         const { data, error } = await supabase
//           .from("Classrooms")
//           .update([
//             {
//               ragflow_dataset_id: ragflowDatasetId,
//               name: name,
//               admin_user_id: id,
//               archived: false,
//             },
//           ])
//           .select("id");

//         if (error) {
//           console.error("Error inserting classroom:", error);
//           return null;
//         }
//     }

// }

/**
 * This function creates a DatasetClient for further operations. It either uses the dataset ID you give (which it assumes came from Supabase),
 * or retrieves the ID from supabase, or creates a new dataset. It will also verify that the ID given or retrieved is a valid dataset in RagFlow.
 * @param classroomConfig Enter the basic classroom information that the client might need
 * @param datasetId Enter the dataset ID if you already have it from a previous Supabase call, otherwise this function will attempt to retrieve it
 * @returns a DatasetClient with a good DatasetID, otherwise null if there was an error
 */
export async function createDatasetClient(
  classroomConfig: DatasetClassroomConfig,
  datasetId: string | undefined = undefined
): Promise<DatasetMutableOperationResult | null> {
  //
  console.log(process.env.RAGFLOW_API_KEY, process.env.RAGFLOW_API_URL )

  try {
    if (!process.env.RAGFLOW_API_KEY || !process.env.RAGFLOW_API_URL) {
      throw Error("Ragflow API key and URL is required in the environment.");
    }
    let client: DatasetClient = {
      classroomConfig: classroomConfig,
      datasetId: datasetId ?? "",
    };

    // We treat a datasetId given to us in the params as if it was given to us by Supabase directly (so this just saves us a call)
    let supabaseHasDatasetId = true;
    if (!datasetId) {
      const attemptedRetrieval = await getClientWithRetrievedDatasetId(client);
      if (!attemptedRetrieval.supabaseSuccess) {
        throw Error(
          "Supabase fetch error, could not verify existence of/retrieve dataset ID."
        );
      }
      ({ client, supabaseHasDatasetId } = attemptedRetrieval);
    }
    // At this point, the client might have a dataset ID and supabaseHasDatasetId accurately reflects this
    // So we default to a dataset not existing and attempt to verify it if we have a valid ID in supabase
    let doesDatasetExist = false;
    if (supabaseHasDatasetId) {
      const verifyResult = await verifyDatasetExistence(client);
      if (!verifyResult.ragflowCallSuccess) {
        throw Error("RagFlow fetch error, could not verify dataset existence.");
      }
      doesDatasetExist = verifyResult.doesExist;
    }

    // This creation occurs if nothing was in supabase OR if the supabase ID was bad
    if (!doesDatasetExist) {
      const createResult = await createAssociatedDataset(client);
      if (!createResult.ragflowCallSuccess || !createResult.supabaseSuccess) {
        throw Error("Error creating dataset.");
      }
      ({ client } = createResult);
    }

    // Guaranteed to return a client with a good dataset behind it
    return { client };
  } catch (error) {
    console.error(
      `Error while creating Ragflow client for classroom ID ${classroomConfig.classroomId}`,
      error
    );
    return null;
  }
}

/**
 * Just returns boolean for whether the client's datasetId refers to a real/valid dataset in RagFlow
 * @param client Previously created client with `createDatasetClient()`
 * @returns `doesExist` for whether the dataset does exist within RagFlow. Verify credibility with ragflowCallSuccess
 */
export async function verifyDatasetExistence(
  client: DatasetClient
): Promise<
  DatasetReadOnlyOperationResult & {
    ragflowCallSuccess: boolean;
    doesExist: boolean;
  }
> {
  const params = new URLSearchParams({ id: client.datasetId });
  const response = await fetch(`${getDatasetUrl()}?${params.toString()}`, {
    method: "GET",
    headers: getHeader(),
  });
  const jsonData = await response.json();
  if (!response.ok) {
    console.error(
      "DatasetService, verify dataset exist, Ragflow fetch error:",
      jsonData
    );
    return { ragflowCallSuccess: false, doesExist: false };
  }
  if (!jsonData?.data?.length) {
    return { ragflowCallSuccess: true, doesExist: false };
  }
  return { ragflowCallSuccess: true, doesExist: true };
}

/**
 * A call to get a mutated client object with the dataset ID of a newly created Ragflow dataset
 * Also makes sure to update this ID within Supabase
 * @param client Previously created client with `createDatasetClient()`
 * @returns A mutated client with an updated dataset ID. Verify credibility if true for both `ragflowCallSuccess` and `supabaseSuccess`
 */
export async function createAssociatedDataset(client: DatasetClient): Promise<
  DatasetMutableOperationResult & {
    ragflowCallSuccess: boolean;
    supabaseSuccess: boolean;
  }
> {
  // First: make the call to Ragflow to create a dataset with correct properties
  const timestamp = Date.now();
  const datasetName = `${client.classroomConfig.classroomName}_${timestamp}_${client.classroomConfig.classroomId.substring(0, 6)}`;
  const ragflowResponse = await fetch(getDatasetUrl(), {
    method: "POST",
    headers: getHeader(),
    body: JSON.stringify({
      name: datasetName,
    }),
  });

  // Verify the Ragflow API call result
  const ragflowResponseData = await ragflowResponse.json();
  if (!ragflowResponse.ok) {
    console.error(
      "DatasetService, creating dataset in RAGFlow:",
      ragflowResponseData
    );
    return {
      client: client,
      ragflowCallSuccess: false,
      supabaseSuccess: false,
    };
  }

  const ragflowDatasetId = ragflowResponseData.data.id;

  // Insert the new dataset's ID into Supabase
  const supabase = await createServiceClient();
  const { data: updatedRow, error } = await supabase
    .from("Classrooms")
    .update({ ragflow_dataset_id: ragflowDatasetId })
    .eq("id", Number(client.classroomConfig.classroomId))
    .select()
    .single();

  // Verify that Supabase was successfully updated
  if (error || !updatedRow.ragflow_dataset_id) {
    console.error(
      `DatasetService, creating dataset in RAGFlow, failed to update supabase: ${error} | updated row: ${updatedRow}`
    );
    return {
      client: client,
      ragflowCallSuccess: true,
      supabaseSuccess: false,
    };
  }

  // Return the updated client with the new dataset ID
  return {
    client: { ...client, datasetId: ragflowDatasetId },
    ragflowCallSuccess: true,
    supabaseSuccess: true,
  };
}

/**
 * A call to get a mutated client object with the dataset ID (attempted) retrieved from Supabase
 * @param client Client to perform operation on
 * @returns A mutated client with an updated dataset ID (although this is only updated if and only if supabaseHasDatasetId is also true).
 * Verify credibility of attempt with `supabaseSuccess`.
 */
export async function getClientWithRetrievedDatasetId(
  client: DatasetClient
): Promise<
  DatasetMutableOperationResult & {
    supabaseSuccess: boolean;
    supabaseHasDatasetId: boolean;
  }
> {
  // Retrieve the dataset ID from Supabase using the classroom ID
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("Classrooms")
    .select("ragflow_dataset_id")
    .eq("id", Number(client.classroomConfig.classroomId))
    .single();

  // Error out if Supabase fails
  if (error || !data) {
    console.error(
      `Failed to fetch dataset id from supabase for classroom: ${error}`
    );
    return {
      client: client,
      supabaseSuccess: false,
      supabaseHasDatasetId: false,
    };
  }

  // If the row is missing the dataset ID, note that with supabaseHasDatasetId
  if (!data.ragflow_dataset_id) {
    return {
      client: client,
      supabaseSuccess: true,
      supabaseHasDatasetId: false,
    };
  }

  return {
    client: { ...client, datasetId: data.ragflow_dataset_id },
    supabaseSuccess: true,
    supabaseHasDatasetId: true,
  };
}

/**
 * Just returns boolean for whether the client's datasetId refers to a real/valid dataset in RagFlow
 * @param client Previously created client with `createDatasetClient()`
 * @returns `doesExist` for whether the dataset does exist within RagFlow. Verify credibility with ragflowCallSuccess
 */
export async function retrieveDocuments(
  client: DatasetClient
): Promise<
  DatasetReadOnlyOperationResult & {
    ragflowCallSuccess: boolean;
    files: DocumentFile[];
  }
> {
  const params = new URLSearchParams({
    page: "1",
    page_size: "30",
    orderby: "create_time",
    desc: "true",
  });
  const response = await fetch(
    `${getDatasetUrl()}/${client.datasetId}/documents?${params.toString()}`,
    {
      method: "GET",
      headers: getHeader(),
    }
  );
  const jsonData = await response.json();
  if (!response.ok) {
    console.error(
      "DatasetService, retrieve documents, Ragflow fetch error:",
      jsonData
    );
    return { ragflowCallSuccess: false, files: [] };
  }
  if (jsonData.code !== 0) {
    return {
      ragflowCallSuccess: false,
      files: [],
    };
  }
  const filesList: DocumentFile[] = jsonData.data.docs.map(
    (file: DocumentFile) => ({
      id: file.id,
      datasetId: client.datasetId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: file.run !== undefined ? file.run : "PENDING",
    })
  );
  return { ragflowCallSuccess: true, files: filesList };
}

export async function uploadFile(
  client: DatasetClient,
  formData: FormData
): Promise<
  DatasetReadOnlyOperationResult & {
    uploadCallSuccess: boolean;
    parseCallSuccess: boolean;
    isAdmin: boolean;
    files: DocumentFile[];
  }
> {
  // Check if the user is the admin for this classroom (need to move the isUser function somewhere else later)
  const isAdmin = await isUserAdminForClassroom(
    Number(client.classroomConfig.classroomId)
  );
  if (!isAdmin) {
    return {
        isAdmin: false,
      uploadCallSuccess: false,
      parseCallSuccess: false,
      files: [],
    };
  }

  const uploadResponse = await fetch(
    `${getDatasetUrl()}/${client.datasetId}/documents`,
    {
      method: "POST",
      headers: { ...getHeader(), "Content-Type": "multipart/form-data" },
      body: formData,
    }
  );
  const uploadJsonData = await uploadResponse.json();
  if (!uploadResponse.ok || (uploadJsonData && !uploadJsonData?.data?.length)) {
    console.error(
      "DatasetService, upload documents, Ragflow call error:",
      uploadJsonData
    );
    return {
        isAdmin: true,

      uploadCallSuccess: false,
      parseCallSuccess: false,
      files: [],
    };
  }

  const fileId = uploadJsonData.data[0].id;

  const parseResponse = await fetch(
    `${getDatasetUrl()}/${client.datasetId}/chunks`,
    {
      method: "POST",
      headers: getHeader(),
      body: JSON.stringify({ document_ids: [fileId] }),
    }
  );

  const parseJsonData = await parseResponse.json();

  if (!parseResponse.ok || parseJsonData.code !== 0) {
    return {
      isAdmin: true,
      uploadCallSuccess: true,
      parseCallSuccess: false,
      files: [],
    };
  }

  const { files: fileList } = await retrieveDocuments(client);
  return {
    isAdmin: true,
    uploadCallSuccess: true,
    parseCallSuccess: true,
    files: fileList,
  };
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

const getDatasetUrl = () => {
  return `${stripTrailingSlash(process.env.RAGFLOW_API_URL!)}/api/v1/datasets`; // definite assertion (!) since verified in "constructor"
};

const getHeader = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.RAGFLOW_API_KEY!}`, // definite assertion (!) since verified in "constructor"
  };
};
