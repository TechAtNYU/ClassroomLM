"use server";
import { createServiceClient } from "@/utils/supabase/service-server";

export type TableStorageInfo = {
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

export type ModelSettings = {
  promptSettings: PromptSettings;
  llmSettings: LLMSettings;
  promptType: string;
};

// TODO: for base and session, add verification that key/values for storage are nonzero
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

export type RagFlowMessage = {
  content: string;
  role: "assistant" | "user";
};

export type RagFlowMessages = RagFlowMessage[];

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
  assistantId: string | null = null,
  sessionId: string | null = null
): Promise<
  { client: ChatBaseClient | ChatClientWithSession | null } & {
    failBecauseDatasetEmpty: boolean;
    messageHistory: RagFlowMessages | null;
  }
> {
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
      if (createResult.failBecauseDatasetEmpty) {
        return {
          client: null,
          failBecauseDatasetEmpty: true,
          messageHistory: null,
        };
      }
      if (!createResult.ragflowCallSuccess || !createResult.supabaseSuccess) {
        throw Error("Error creating assistant.");
      }
      client = createResult.client;
    }

    if (!doesConfigHaveSession(clientConfig)) {
      // Guaranteed to return a client with a good assistant behind it
      return { client, failBecauseDatasetEmpty: false, messageHistory: null };
    }

    /* ----- SESSION SECTION -------- */

    const clientConfigWithSession = clientConfig as ChatClientWithSessionConfig;
    let clientWithSession: ChatClientWithSession = {
      clientConfig: clientConfigWithSession,
      assistantId: client.assistantId,
      sessionId: sessionId ?? "",
    };

    // We treat a sessionId given to us in the params as if it was given to us by Supabase directly (so this just saves us a call)
    let supabaseHasSessionId = true;
    if (!sessionId) {
      const attemptedRetrieval =
        await getClientWithRetrievedSessionId<ChatClientWithSession>(
          clientWithSession
        );
      if (!attemptedRetrieval.supabaseSuccess) {
        throw Error(
          "Supabase fetch error, could not verify existence of/retrieve session ID."
        );
      }
      clientWithSession = attemptedRetrieval.client;
      supabaseHasSessionId = attemptedRetrieval.supabaseHasSessionId;
    }
    // At this point, the client might have an session ID and supabaseHasSessionId accurately reflects this
    // So we default to an session not existing and attempt to verify it if we have a valid ID in supabase
    let doesSessionExist = false;
    let messageHistory = null;
    if (supabaseHasSessionId) {
      const verifyResult = await verifySessionExistence(clientWithSession);
      if (!verifyResult.ragflowCallSuccess) {
        throw Error("RagFlow fetch error, could not verify session existence.");
      }
      doesSessionExist = verifyResult.doesExist;
      messageHistory = verifyResult.messageHistory;
    }
    // This creation occurs if nothing was in supabase OR if the supabase ID was bad
    if (!doesSessionExist) {
      const createResult = await createAssociatedSession(clientWithSession);
      if (!createResult.ragflowCallSuccess) {
        throw Error("Error creating session during RagFlow call");
      }
      if (!createResult.supabaseSuccess) {
        throw Error("Error creating session during Supabase call.");
      }
      clientWithSession = createResult.client;
      messageHistory = createResult.initialMessages;
    }

    // Guaranteed to return a client with a good dataset behind it
    return {
      client: clientWithSession,
      failBecauseDatasetEmpty: false,
      messageHistory: messageHistory,
    };
  } catch (error) {
    console.error(
      `Error while creating Ragflow assistant/session for config: ${clientConfig}`,
      error
    );
    return {
      client: null,
      failBecauseDatasetEmpty: false,
      messageHistory: null,
    };
  }
}

function doesConfigHaveSession(
  config: ChatClientBaseConfig
): config is ChatClientWithSessionConfig {
  return (config as ChatClientWithSessionConfig).sessionIdStorage !== undefined;
}

/**
 * A call to get a mutated client object with the assistant ID (attempted) retrieved from Supabase
 * @param client Client to perform operation on
 * @returns A mutated client with an updated assistant ID (although this is only updated if and only if supabaseHasAssistantId is also true).
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
  // console.log(buildQuery)
  const { data, error } = await buildQuery.single();
  // console.log("supabase fetch data", data)
  // Error out if Supabase fails
  if (error || !data) {
    console.error(
      `Failed to fetch assistant id from supabase for classroom: ${JSON.stringify(error)}`
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
 * Just returns boolean for whether the client's datasetId refers to a real/valid assistant in RagFlow
 * @param client Previously created client with `createChatClient()`
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
 * A call to get a mutated client object with the dataset ID of a newly created Ragflow assistant.
 * Also makes sure to update this ID within Supabase.
 * @param client Previously created client with `createChatClient()`
 * @returns A mutated client with an updated assistant ID. Verify credibility if true for both `ragflowCallSuccess` and `supabaseSuccess`
 */
export async function createAssociatedAssistant<T extends ChatBaseClient>(
  client: T
): Promise<
  ChatMutableOperationResult<T> & {
    ragflowCallSuccess: boolean;
    failBecauseDatasetEmpty: boolean;
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
      llm: client.clientConfig.modelSettings.llmSettings,
    }),
  });
  // Verify the Ragflow API call result
  const ragflowResponseData = await ragflowResponse.json();
  if (!ragflowResponse.ok || !ragflowResponseData?.data?.id) {
    if (
      ragflowResponseData?.message &&
      ragflowResponseData.message.includes("doesn't own parsed file")
    ) {
      return {
        client: client,
        ragflowCallSuccess: false,
        failBecauseDatasetEmpty: true,
        supabaseSuccess: false,
      };
    }
    console.error(
      "ChatClient, error creating assistant in RAGFlow:",
      ragflowResponseData
    );
    return {
      client: client,
      ragflowCallSuccess: false,
      failBecauseDatasetEmpty: false,
      supabaseSuccess: false,
    };
  }
  const ragflowAssistantId = ragflowResponseData.data.id;

  // Insert the new assistant's ID into Supabase
  const supabase = await createServiceClient();

  let buildQuery = supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(client.clientConfig.assistantIdStorage.table as any) // we ignore error here cause its a pain to get the table column names within our TableStorage type
    .update({
      [client.clientConfig.assistantIdStorage.column]: ragflowAssistantId,
    });

  for (const pair of client.clientConfig.primaryKeyValuesAssistant) {
    buildQuery = buildQuery.eq(pair.key, pair.value);
  }
  const { data: updatedRow, error } = await buildQuery.select().single();
  // console.log("updatedrow", updatedRow)
  // Verify that Supabase was successfully updated

  if (
    error ||
    !(
      updatedRow as unknown as {
        [client.clientConfig.assistantIdStorage.column]: string;
      }
    )[client.clientConfig.assistantIdStorage.column]
  ) {
    console.error(
      `ChatClient, creating assistant in RAGFlow, failed to update supabase: ${error} | updated row: ${updatedRow}`
    );
    return {
      client: client,
      ragflowCallSuccess: true,
      failBecauseDatasetEmpty: false,
      supabaseSuccess: false,
    };
  }

  // Return the updated client with the new dataset ID
  return {
    client: { ...client, assistantId: ragflowAssistantId },
    ragflowCallSuccess: true,
    failBecauseDatasetEmpty: false,
    supabaseSuccess: true,
  };
}

/**
 * A call to get a mutated client object with the session ID (attempted) retrieved from Supabase
 * @param client Client to perform operation on
 * @returns A mutated client with an updated session ID (although this is only updated if and only if supabaseHasSessionId is also true).
 * Verify credibility of attempt with `supabaseSuccess`.
 */
export async function getClientWithRetrievedSessionId<
  T extends ChatClientWithSession,
>(
  client: T
): Promise<
  ChatMutableOperationResult<T> & {
    supabaseSuccess: boolean;
    supabaseHasSessionId: boolean;
  }
> {
  // Retrieve the session ID from Supabase using the given ids and table information
  const supabase = await createServiceClient();
  let buildQuery = supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(client.clientConfig.sessionIdStorage.table as any) // we ignore error here cause its a pain to get the table column names within our TableStorage type
    .select(client.clientConfig.sessionIdStorage.column);
  for (const pair of client.clientConfig.primaryKeyValuesSession) {
    buildQuery = buildQuery.eq(pair.key, pair.value);
  }
  // console.log(buildQuery)
  const { data, error } = await buildQuery.single();
  // console.log("supabase fetch data", data)
  // Error out if Supabase fails
  if (error || !data) {
    console.error(
      `Failed to fetch session id from supabase for classroom: ${JSON.stringify(error)}`
    );
    return {
      client: client,
      supabaseSuccess: false,
      supabaseHasSessionId: false,
    };
  }

  // If the row is missing the session ID, note that with supabaseHasSessionId
  // we do all this casting because (again) its a pain to make it verified as actual columns/tables within supabase typing
  if (
    !(
      data as unknown as {
        [client.clientConfig.sessionIdStorage.column]: string;
      }
    )[client.clientConfig.sessionIdStorage.column]
  ) {
    return {
      client: client,
      supabaseSuccess: true,
      supabaseHasSessionId: false,
    };
  }

  return {
    client: {
      ...client,
      sessionId: (
        data as unknown as {
          [client.clientConfig.sessionIdStorage.column]: string;
        }
      )[client.clientConfig.sessionIdStorage.column],
    },
    supabaseSuccess: true,
    supabaseHasSessionId: true,
  };
}

/**
 * Just returns boolean for whether the client's sessionId refers to a real/valid assistant in RagFlow
 * @param client Previously created client with `createChatClient()`
 * @returns `doesExist` for whether the session does exist within RagFlow. Verify credibility with ragflowCallSuccess
 */
export async function verifySessionExistence(
  client: ChatClientWithSession
): Promise<
  ChatReadOnlyOperationResult & {
    ragflowCallSuccess: boolean;
    doesExist: boolean;
    messageHistory: RagFlowMessages | null;
  }
> {
  const params = new URLSearchParams({ id: client.sessionId });
  const response = await fetch(
    `${getSessionUrl(client.assistantId)}?${params.toString()}`,
    {
      method: "GET",
      headers: getHeader(),
    }
  );
  const jsonData = await response.json();
  if (!response.ok) {
    console.error(
      "ChatClient service, verify session exist, Ragflow fetch error:",
      jsonData
    );
    return {
      ragflowCallSuccess: false,
      doesExist: false,
      messageHistory: null,
    };
  }
  if (!jsonData?.data?.length) {
    return { ragflowCallSuccess: true, doesExist: false, messageHistory: null };
  }

  return {
    ragflowCallSuccess: true,
    doesExist: true,
    messageHistory: jsonData?.data?.[0]?.messages,
  };
}

/**
 * A call to get a mutated client object with the session ID of a newly created Ragflow session for a corresponding assistant.
 * Also makes sure to update this ID within Supabase.
 * @param client Previously created client with `createChatClient()`
 * @returns A mutated client with an updated session ID. Verify credibility if true for both `ragflowCallSuccess` and `supabaseSuccess`
 */
export async function createAssociatedSession<T extends ChatClientWithSession>(
  client: T
): Promise<
  ChatMutableOperationResult<T> & {
    ragflowCallSuccess: boolean;
    supabaseSuccess: boolean;
    initialMessages: RagFlowMessages | null;
  }
> {
  // First: make the call to Ragflow to create an session with correct properties
  const timestamp = Date.now();
  const userId =
    client.clientConfig.primaryKeyValuesSession.find((x) =>
      x.key.includes("user")
    )?.value ?? `${client.clientConfig.associatedClassroomName}_user`;
  const sessionName = `personal_${userId}_${timestamp}`;
  const ragflowResponse = await fetch(getSessionUrl(client.assistantId), {
    method: "POST",
    headers: getHeader(),
    body: JSON.stringify({
      name: sessionName,
      user_id: `personal_${client.clientConfig.primaryKeyValuesSession[0].value}_${timestamp}`,
    }),
  });
  // Verify the Ragflow API call result
  const ragflowResponseData = await ragflowResponse.json();
  if (!ragflowResponse.ok || !ragflowResponseData?.data?.id) {
    console.error(
      `ChatClient, error creating session for assistant ID (${client.assistantId}) in RAGFlow:`,
      ragflowResponseData
    );
    return {
      client: client,
      ragflowCallSuccess: false,
      supabaseSuccess: false,
      initialMessages: null,
    };
  }
  const ragflowSessionId = ragflowResponseData.data.id;

  // Insert the new session's ID into Supabase
  const supabase = await createServiceClient();

  let buildQuery = supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(client.clientConfig.sessionIdStorage.table as any) // we ignore error here cause its a pain to get the table column names within our TableStorage type
    .update({
      [client.clientConfig.sessionIdStorage.column]: ragflowSessionId,
    });

  for (const pair of client.clientConfig.primaryKeyValuesSession) {
    buildQuery = buildQuery.eq(pair.key, pair.value);
  }
  const { data: updatedRow, error } = await buildQuery.select().single();
  // console.log("updatedrow", updatedRow)
  // Verify that Supabase was successfully updated

  if (
    error ||
    !(
      updatedRow as unknown as {
        [client.clientConfig.sessionIdStorage.column]: string;
      }
    )[client.clientConfig.sessionIdStorage.column]
  ) {
    console.error(
      `ChatClient, creating session in RAGFlow, failed to update supabase: ${error} | updated row: ${updatedRow}`
    );
    return {
      client: client,
      ragflowCallSuccess: true,
      supabaseSuccess: false,
      initialMessages: null,
    };
  }

  // Return the updated client with the new session ID
  return {
    client: { ...client, sessionId: ragflowSessionId },
    ragflowCallSuccess: true,
    supabaseSuccess: true,
    initialMessages: ragflowResponseData?.data?.messages,
  };
}

/**
 * Sends a message to a client's session.
 * @param client Previously created client with `createChatClient()`
 * @param formData Form with `file` as an attribute with a `File` object from a form
 * @returns a list of `files` if a successful upload and parse start. Also: use `isAdmin`, `uploadCallSuccess`, and
 * `parseCallSuccess` to verify if those different stages were successful.
 */
export async function sendMessage(
  client: ChatClientWithSession,
  message: string
): Promise<
  | (ChatReadOnlyOperationResult & {
      ragflowCallSuccess: true;
      response: string;
    })
  | {
      ragflowCallSuccess: false;
      response: null;
    }
> {
  const params = {
    question: message,
    session_id: client.sessionId,
    stream: false,
  };

  const chatResponse = await fetch(getCompletionsUrl(client.assistantId), {
    method: "POST",
    headers: getHeader(),
    body: JSON.stringify(params),
  });

  // Make sure that the upload was successful
  const chatJsonData = await chatResponse.json();
  if (
    !chatResponse.ok ||
    chatJsonData?.data?.length ||
    !chatJsonData?.data?.answer
  ) {
    console.error(
      "ChatClient server, message session, Ragflow call error:",
      chatJsonData,
      chatJsonData?.data?.length
    );
    return {
      ragflowCallSuccess: false,
      response: null,
    };
  }

  return {
    ragflowCallSuccess: true,
    response: chatJsonData.data.answer,
  };
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

const getAssistantUrl = () => {
  return `${stripTrailingSlash(process.env.RAGFLOW_API_URL!)}/api/v1/chats`; // definite assertion (!) since verified in "constructor"
};

const getSessionUrl = (assistantId: string) => {
  return `${stripTrailingSlash(process.env.RAGFLOW_API_URL!)}/api/v1/chats/${assistantId}/sessions`; // definite assertion (!) since verified in "constructor"
};

const getCompletionsUrl = (assistantId: string) => {
  return `${stripTrailingSlash(process.env.RAGFLOW_API_URL!)}/api/v1/chats/${assistantId}/completions`; // definite assertion (!) since verified in "constructor"
};

const getHeader = () => {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.RAGFLOW_API_KEY!}`, // definite assertion (!) since verified in "constructor"
  };
};
