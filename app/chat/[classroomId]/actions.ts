"use server";

import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service-server";

export type RagFlowMessage = {
  content: string;
  role: string; // change this to literal "assistant" or "user"?
};

type ClassroomId = number;

export type RagFlowMessages = RagFlowMessage[];

// import { UUID } from "crypto";

export async function getCurrentUserId() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw Error("No authenticated user found");
  }
  return user.id;
}

export async function getRagflowDatasetId(classroomId: ClassroomId) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("Classroom")
    .select("ragflow_dataset_id")
    .eq("id", classroomId)
    .single();

  if (error) {
    console.error("Error fetching classroom:", error);
    throw new Error(`Failed to fetch classroom: ${error.message}`);
  }

  if (!data) {
    throw new Error(`No classroom found with id: ${classroomId}`);
  }

  return data.ragflow_dataset_id;
}

const API_URL = process.env.RAGFLOW_API_URL + "/api" || "";
const API_KEY = process.env.RAGFLOW_API_KEY;

export async function getOrCreateAssistant(
  classroomId: number,
  datasetId: string
) {
  const existingChat = await findChatAssistant(classroomId);
  if (existingChat) {
    return { status: "success", id: existingChat };
  }

  console.log("Get or create: didn't find an assistant, creating a new one");

  const newAssistant = await createChatAssistant(classroomId, datasetId);
  if (!newAssistant?.data && newAssistant?.status) {
    return { status: "empty", id: null };
  }
  return { status: "success", id: newAssistant.data.id };
}

export async function findChatAssistant(classroomId: ClassroomId) {
  try {
    // const res = await fetch(
    //   `${API_URL}/v1/chats?page=1&page_size=10&orderby=create_time&desc=true&name=${datasetId}`,
    //   {
    //     method: "GET",
    //     headers: {
    //       Authorization: `Bearer ${API_KEY}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    const supabase = await createClient();

    const res = await supabase
      .from("Classroom")
      .select("chat_assistant_id")
      .eq("id", classroomId)
      .single();

    if (res.error) throw new Error(`Failed to fetch chats: ${res.error}`);

    const data = res.data.chat_assistant_id;

    // console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching chat assistant:", error);
    return null;
  }
}

async function createChatAssistant(
  classroomId: ClassroomId,
  datasetId: string
) {
  const newAssistant = {
    dataset_ids: [datasetId],
    name: `${datasetId}-${classroomId}`,
  };

  try {
    const res = await fetch(`${API_URL}/v1/chats`, {
      method: "POST",
      body: JSON.stringify(newAssistant),
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (!res.ok) throw new Error("Failed to create chat assistant");

    const resJson = await res.json();
    if (!resJson?.data) {
      if (
        resJson?.message &&
        resJson.message.includes("doesn't own parsed file")
      ) {
        return { status: "empty" };
      }
      throw new Error(`Failed to create assistant`);
    }

    // update that in supabase
    const supabase = createServiceClient();

    const supabaseRes = await supabase
      .from("Classroom")
      .update({ chat_assistant_id: resJson.data.id })
      .eq("id", classroomId)
      .select();

    if (supabaseRes.error) {
      throw new Error(`Failed to update classroom: ${supabaseRes.error}`);
    }

    // console.log("creator", res);
    return resJson;
  } catch (error) {
    console.error("Error creating chat assistant:", error);
    return null;
  }
}

export async function getOrCreateSession(
  userID: string,
  chatAssistantId: string,
  classroomId: ClassroomId
) {
  const existingSession = await findSessionID(classroomId, userID);
  console.log("Found an existing session:", existingSession);
  if (existingSession) {
    return existingSession;
  }

  return await createSession(chatAssistantId, userID, classroomId);
}

async function findSessionID(classroomId: ClassroomId, userID: string) {
  try {
    // find it from the supabase
    const supabase = await createClient();

    const sessionID = await supabase
      .from("Classroom_Members")
      .select("ragflow_session_id")
      .eq("classroom_id", classroomId)
      .eq("user_id", userID);

    if (sessionID.error) {
      console.error("Error fetching session:", sessionID.error);
      return null;
    }

    return sessionID.data[0].ragflow_session_id; // Return the first session if available
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

async function createSession(
  assistantID: string,
  userID: string,
  classroomId: ClassroomId
) {
  const newSession = {
    assistant_id: assistantID,
    user_id: userID,
    name: `Session_${userID}`,
  };

  try {
    const res = await fetch(`${API_URL}/v1/chats/${assistantID}/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newSession),
    });

    if (!res.ok) throw new Error("Failed to create session");

    const resJson = await res.json();

    // update that in supabase
    const supabase = createServiceClient();

    const supabaseRes = await supabase
      .from("Classroom_Members")
      .update({ ragflow_session_id: resJson.data.id })
      .eq("classroom_id", classroomId)
      .eq("user_id", userID)
      .select();

    if (supabaseRes.error) {
      throw new Error(`Failed to update classroom: ${supabaseRes.error}`);
    }

    return resJson.data.id;
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
}

export async function sendMessage(
  message: string,
  assistantID: string,
  chatSessionID: string
) {
  // console.log("Message sent: ", message);
  // console.log("Assistant ID: ", assistantID);

  const params = {
    question: message,
    session_id: chatSessionID,
    stream: false,
  };

  try {
    const res = await fetch(`${API_URL}/v1/chats/${assistantID}/completions`, {
      method: "POST",
      body: JSON.stringify(params),
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-type": "application/json; charset=UTF-8",
      },
    });

    if (!res) throw new Error("Failed to send message");

    const resp = await res.json();
    console.log(resp);
    // console.log("ANS", resp.data.answer);

    // console.log(resp.choices[0].message.content);

    const resAnswer = resp.data.answer;

    return resAnswer;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}

export async function getDisplayInfo(classroomId: ClassroomId, userId: string) {
  const supabase = await createClient();

  const classroomNameResponse = await supabase
    .from("Classroom")
    .select("name")
    .eq("id", classroomId);

  const userEmailResponse = await supabase
    .from("Users")
    .select("email")
    .eq("id", userId);

  if (classroomNameResponse.error || userEmailResponse.error) {
    throw new Error("Failed to fetch details");
  }

  // console.log(classroomNameResponse.data[0].name);

  // console.log(userEmailResponse.data[0].email);

  return [classroomNameResponse.data[0].name, userEmailResponse.data[0].email];
}

export async function retrieveMessageHistory(
  assistantID: string,
  userID: string,
  chatSessionID: string
): Promise<RagFlowMessages | null> {
  // console.log("Message sent: ", message);
  // console.log("Assistant ID: ", assistantID);

  const params = new URLSearchParams();
  params.append("id", chatSessionID);
  params.append("user_id", userID);
  try {
    const res = await fetch(
      `${API_URL}/v1/chats/${assistantID}/sessions${params.size != 0 ? "?" + params : ""}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );

    if (!res) throw new Error("Failed to retrieve message history");

    const resp = await res.json();

    if (!resp?.data?.[0]?.messages) {
      console.log("Message history invalid or empty");
      return [];
    }
    // console.log("ANS", resp.data.answer);

    // console.log(resp.choices[0].message.content);

    const resAnswer = resp.data[0].messages;

    return resAnswer;
  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }
}
