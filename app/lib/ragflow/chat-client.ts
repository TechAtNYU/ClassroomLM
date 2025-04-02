"use server";
import { isUserAdminForClassroom } from "@/app/classroom/[classroomId]/upload/actions";
import { Tables } from "@/utils/supabase/database.types";
import { createServiceClient } from "@/utils/supabase/service-server";

type TableStorageInfo = {
  column: string;
  table: string; // might want to verify columns in TS, but thats a lot of work
};

type PromptSettings = {
  prompt: string;
  opener?: string;
  empty_response: string;
  variables: { key: string; optional: boolean }[];
  keywords_similarity_weight: number;
  similarity_threshold: number;
  top_n: number;
  show_quote: boolean;
};

type LLMSettings = {
  frequency_penalty: number;
  presence_penalty: number;
  temperature: number;
  top_p: number;
};

type ModelSettings = {
  promptSettings: PromptSettings;
  llmSettings: LLMSettings;
  promptType: string;
};

export interface ChatClientBaseConfig {
  associatedClassroomName: string;
  primaryKeyValuesAssistant: { key: string; value: unknown }[]; // to be used to match against the primary key (eg. classroomID)
  assistantIdStorage: TableStorageInfo;
  modelSettings: ModelSettings;
  datasets: string[];
}

export type ChatClientWithSessionConfig = ChatClientBaseConfig & {
  primaryKeyValuesSession: { key: string; value: unknown }[]; // to be used to match against the primary key (eg. classroomID)
  sessionIdStorage: TableStorageInfo;
};

export type ChatBaseClient = {
  clientConfig: ChatClientBaseConfig;
  assistantId: string;
};

export type ChatClientWithSession = ChatBaseClient & {
  clientConfig: ChatClientWithSessionConfig;
  sessionId: string;
};

const personalChatConfigTemplate = {
  assistantIdStorage: {
    table: "classroom",
    column: "chat_assistant_id",
  } as TableStorageInfo,
  sessionIdStorage: {
    table: "Classroom_Members",
    column: "ragflow_session_id",
  } as TableStorageInfo,
  modelSettings: {
    promptSettings: {
      prompt: "test",
      empty_response: "",
      opener: "Hi! How can I help you today?",
      variables: [{ key: "knowledge", optional: true }],
      keywords_similarity_weight: 0.75,
      similarity_threshold: 0.2,
      top_n: 6,
      show_quote: true,
    },
    llmSettings: {
      temperature: 0.4,
      presence_penalty: 0.3,
      frequency_penalty: 0.6,
      top_p: 0.3,
    },
    promptType: "simple"
  } as ModelSettings,
};

/**
 * Result from any operation that changes the client itself
 *
 * **MAKE SURE TO SET YOUR CLIENT TO THE RETURNED CLIENT FROM THIS**
 */
type ChatMutableOperationResult<T extends ChatBaseClient> = {
  client: T;
};

// Might change later with more common fields for a non-client changing operation
type ChatReadOnlyOperationResult = object;

/**
 * This function creates a DatasetClient for further operations. It either uses the dataset ID you give (which it assumes came from Supabase),
 * or retrieves the ID from supabase, or creates a new dataset. It will also verify that the ID given or retrieved is a valid dataset in RagFlow.
 * If the given ID is invalid or the ID from supabase is invalid, it will make a new dataset and set the field to the Supabase to reflect that.
 * @param classroomConfig Enter the basic classroom information that the client might need
 * @param datasetId Enter the dataset ID if you already have it from a previous Supabase call, otherwise this function will attempt to retrieve it
 * @returns a DatasetClient with a good DatasetID, otherwise null if there was an error
 */
export async function createChatClient<T extends ChatClientBaseConfig>(
  clientConfig: T,
  assistantId: string | undefined = undefined,
  sessionId: string | undefined = undefined
) {
  // ): Promise<ChatMutableOperationResult<datasetId> | null> {
    // const a: ChatClientWithSessionConfig = {
    //   ...personalChatConfigTemplate,
    //   associatedClassroomName: "",
    //   primaryKeyValuesAssistant: [{key: "id", value: "cl"}],
    //   primaryKeyValuesSession: [{key: "c", value: "cl"}, {key: "u", value: "cl"}],
    //   datasets: [""]
    // }

  //   };
  try {
    if (!process.env.RAGFLOW_API_KEY || !process.env.RAGFLOW_API_URL) {
      throw Error("Ragflow API key and URL is required in the environment.");
    }
    let client: ChatBaseClient = {
      clientConfig: clientConfig,
      // only temporarily keeps this as "" before it deterministically is either
      // the user provided datasetId from the param or the one from supabase or a newly
      // created dataset's ID straight from Ragflow
      assistantId: assistantId ?? "",
      //   sessionId: sessionId ?? "",
    };

    // We treat a datasetId given to us in the params as if it was given to us by Supabase directly (so this just saves us a call)
    let supabaseHasAssistantId = true;
    if (!assistantId) {
      const attemptedRetrieval =
        await getClientWithRetrievedAssistantId<ChatBaseClient>(client);
      if (!attemptedRetrieval.supabaseSuccess) {
        throw Error(
          "Supabase fetch error, could not verify existence of/retrieve dataset ID."
        );
      }
      client = attemptedRetrieval.client;
      supabaseHasAssistantId = attemptedRetrieval.supabaseHasAssistantId;
    }
    // At this point, the client might have an assistant ID and supabaseHasAssistantId accurately reflects this
    // So we default to an assistant not existing and attempt to verify it if we have a valid ID in supabase
    let doesAssistantExist = false;

    if (supabaseHasAssistantId) {
      const verifyResult = await verifyAssistantExistence(client);
      if (!verifyResult.ragflowCallSuccess) {
        throw Error(
          "RagFlow fetch error, could not verify assistant existence."
        );
      }
      doesAssistantExist = verifyResult.doesExist;
    }
    // This creation occurs if nothing was in supabase OR if the supabase ID was bad
    if (!doesAssistantExist) {
      const createResult = await createAssociatedAssistant(client);
      if (!createResult.ragflowCallSuccess || !createResult.supabaseSuccess) {
        throw Error("Error creating assistant.");
      }
      client = createResult.client;
    }

    if (!doesConfigHaveSession(clientConfig)) {
      // Guaranteed to return a client with a good assistant behind it
      return { client };
    }
    let clientWithSession = clientConfig as ChatClientWithSessionConfig;
    // move the helper?ish functions to another file for this and data-client?. only keep the actually usable functions here
  } catch (error) {
    console.error(
      `Error while creating Ragflow assistant for config: ${clientConfig}`,
      error
    );
    return null;
  }
}

function doesConfigHaveSession(
  config: ChatClientBaseConfig
): config is ChatClientWithSessionConfig {
  return (config as ChatClientWithSessionConfig).sessionIdStorage !== undefined;
}

/**
 * A call to get a mutated client object with the dataset ID (attempted) retrieved from Supabase
 * @param client Client to perform operation on
 * @returns A mutated client with an updated dataset ID (although this is only updated if and only if supabaseHasDatasetId is also true).
 * Verify credibility of attempt with `supabaseSuccess`.
 */
export async function getClientWithRetrievedAssistantId<
  T extends ChatBaseClient,
>(
  client: T
): Promise<
  ChatMutableOperationResult<T> & {
    supabaseSuccess: boolean;
    supabaseHasAssistantId: boolean;
  }
> {
  // Retrieve the assistant ID from Supabase using the given ids and table information
  const supabase = await createServiceClient();
  let buildQuery = supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(client.clientConfig.assistantIdStorage.table as any) // we ignore error here cause its a pain to get the table column names within our TableStorage type
    .select(client.clientConfig.assistantIdStorage.column);
  for (const pair of client.clientConfig.primaryKeyValuesAssistant) {
    buildQuery = buildQuery.eq(pair.key, pair.value);
  }
  const { data, error } = await buildQuery.single();

  // Error out if Supabase fails
  if (error || !data) {
    console.error(
      `Failed to fetch assistant id from supabase for classroom: ${error}`
    );
    return {
      client: client,
      supabaseSuccess: false,
      supabaseHasAssistantId: false,
    };
  }

  // If the row is missing the assistant ID, note that with supabaseHasAssistantId
  // we do all this casting because (again) its a pain to make it verified as actual columns/tables within supabase typing
  if (
    !(
      data as unknown as {
        [client.clientConfig.assistantIdStorage.column]: string;
      }
    )[client.clientConfig.assistantIdStorage.column]
  ) {
    return {
      client: client,
      supabaseSuccess: true,
      supabaseHasAssistantId: false,
    };
  }

  return {
    client: {
      ...client,
      assistantId: (
        data as unknown as {
          [client.clientConfig.assistantIdStorage.column]: string;
        }
      )[client.clientConfig.assistantIdStorage.column],
    },
    supabaseSuccess: true,
    supabaseHasAssistantId: true,
  };
}

/**
 * Just returns boolean for whether the client's datasetId refers to a real/valid dataset in RagFlow
 * @param client Previously created client with `createDatasetClient()`
 * @returns `doesExist` for whether the dataset does exist within RagFlow. Verify credibility with ragflowCallSuccess
 */
export async function verifyAssistantExistence(client: ChatBaseClient): Promise<
  ChatReadOnlyOperationResult & {
    ragflowCallSuccess: boolean;
    doesExist: boolean;
  }
> {
  const params = new URLSearchParams({ id: client.assistantId });
  const response = await fetch(`${getAssistantUrl()}?${params.toString()}`, {
    method: "GET",
    headers: getHeader(),
  });
  const jsonData = await response.json();
  if (!response.ok) {
    console.error(
      "ChatClient service, verify assistant exist, Ragflow fetch error:",
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
 * A call to get a mutated client object with the dataset ID of a newly created Ragflow dataset.
 * Also makes sure to update this ID within Supabase.
 * @param client Previously created client with `createDatasetClient()`
 * @returns A mutated client with an updated dataset ID. Verify credibility if true for both `ragflowCallSuccess` and `supabaseSuccess`
 */
export async function createAssociatedAssistant<T extends ChatBaseClient>(
  client: T
): Promise<
  ChatMutableOperationResult<T> & {
    ragflowCallSuccess: boolean;
    supabaseSuccess: boolean;
  }
> {
  // First: make the call to Ragflow to create an assistant with correct properties
  const timestamp = Date.now();
  const assistantName = `${client.clientConfig.associatedClassroomName}_${timestamp}`;
  const ragflowResponse = await fetch(getAssistantUrl(), {
    method: "POST",
    headers: getHeader(),
    body: JSON.stringify({
      name: assistantName,
      dataset_ids: client.clientConfig.datasets,
      prompt_type: client.clientConfig.modelSettings.promptType,
      prompt: client.clientConfig.modelSettings.promptSettings,
      llm: client.clientConfig.modelSettings.llmSettings
    }),
  });
  // Verify the Ragflow API call result
  const ragflowResponseData = await ragflowResponse.json();
  if (!ragflowResponse.ok) {
    console.error(
      "ChatClient, error creating assistant in RAGFlow:",
      ragflowResponseData
    );
    return {
      client: client,
      ragflowCallSuccess: false,
      supabaseSuccess: false,
    };
  }
  const ragflowAssistantId = ragflowResponseData.data.id;

  // Insert the new assistant's ID into Supabase
  const supabase = await createServiceClient();

    let buildQuery = supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(client.clientConfig.assistantIdStorage.table as any) // we ignore error here cause its a pain to get the table column names within our TableStorage type
    .update({[client.clientConfig.assistantIdStorage.column]:ragflowAssistantId })

    for (const pair of client.clientConfig.primaryKeyValuesAssistant) {
        buildQuery = buildQuery.eq(pair.key, pair.value);
    }
  const { data:updatedRow, error } = await buildQuery.select().single();

  // Verify that Supabase was successfully updated
  
  if (error || !(
    updatedRow as unknown as {
      [client.clientConfig.assistantIdStorage.column]: string;
    }
  )[client.clientConfig.assistantIdStorage.column]) {
    console.error(
      `ChatClient, creating assistant in RAGFlow, failed to update supabase: ${error} | updated row: ${updatedRow}`
    );
    return {
      client: client,
      ragflowCallSuccess: true,
      supabaseSuccess: false,
    };
  }

  // Return the updated client with the new dataset ID
  return {
    client: { ...client, assistantId: ragflowAssistantId },
    ragflowCallSuccess: true,
    supabaseSuccess: true,
  };
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

const getAssistantUrl = () => {
  return `${stripTrailingSlash(process.env.RAGFLOW_API_URL!)}/api/v1/chats`; // definite assertion (!) since verified in "constructor"
};

const getHeader = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.RAGFLOW_API_KEY!}`, // definite assertion (!) since verified in "constructor"
  };
};
