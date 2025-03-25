import { createClient } from "@/utils/supabase/server";
import { createServiceClient } from "@/utils/supabase/service-server";

// TODO: these helpers should probably be combined with the actions in /chat

const API_URL = process.env.RAGFLOW_API_URL + "/api" || "";
const API_KEY = process.env.RAGFLOW_API_KEY;

export const findChatAssistant = async (classroomId: number) => {
  try {
    const supabase = await createClient();

    const res = await supabase
      .from("Classroom")
      .select("chatroom_assistant_id")
      .eq("id", classroomId)
      .not("chatroom_assistant_id", "is", null)
      .single();

    if (res.error) throw new Error(`Failed to fetch chats: ${res.error}`);

    const data = res.data.chatroom_assistant_id;

    // console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching chat assistant:", error);
    return null;
  }
};

export const createChatAssistant = async (
  chatroomId: string,
  classroomId: number,
  datasetId: string
) => {
  const newAssistant = {
    dataset_ids: [datasetId],
    name: `${datasetId}-${chatroomId}`,
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
      .update({ chatroom_assistant_id: resJson.data.id })
      .eq("id", classroomId)
      .select();

    if (supabaseRes.error) {
      throw new Error(`Failed to update classroom: ${supabaseRes.error}`);
    }

    return resJson;
  } catch (error) {
    console.error("Error creating chat assistant:", error);
    return null;
  }
};

export const getOrCreateAssistant = async (
  chatroomId: string,
  datasetId: string,
  classroomId: number
) => {
  const existingChat = await findChatAssistant(classroomId);
  if (existingChat) {
    return { status: "success", id: existingChat };
  }

  console.log("Get or create: didn't find an assistant, creating a new one");

  const newAssistant = await createChatAssistant(
    chatroomId,
    classroomId,
    datasetId
  );
  if (!newAssistant?.data && newAssistant?.status) {
    return { status: "empty", id: null };
  }
  return { status: "success", id: newAssistant.data.id };
};

export const findSessionID = async (
  classroomId: number,
  chatroomId: string
) => {
  try {
    const supabase = await createClient();

    const sessionID = await supabase
      .from("Chatrooms")
      .select("ragflow_session_id")
      .eq("classroom_id", classroomId)
      .eq("id", chatroomId)
      .single();

    if (sessionID.error) {
      console.error("Error fetching session:", sessionID.error);
      return null;
    }

    return sessionID.data.ragflow_session_id;
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
};

async function createSession(
  assistantID: string,
  chatroomId: string,
  classroomId: number
) {
  const newSession = {
    assistant_id: assistantID,
    user_id: chatroomId,
    name: `Session_Chatroom_${chatroomId}`,
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
      .from("Chatrooms")
      .update({ ragflow_session_id: resJson.data.id })
      .eq("classroom_id", classroomId)
      .eq("id", chatroomId)
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

export const getOrCreateSession = async (
  chatroomId: string,
  chatAssistantId: string,
  classroomId: number
) => {
  const existingSession = await findSessionID(classroomId, chatroomId);
  console.log("Found an existing session:", existingSession);
  if (existingSession) {
    return existingSession;
  }

  return await createSession(chatAssistantId, chatroomId, classroomId);
};

export const deleteSession = async (
  chatroomId: string,
  assistantId: string
) => {
  const supabase = await createClient();
  const { data: session, error: sessionError } = await supabase
    .from("Chatrooms")
    .select("ragflow_session_id")
    .eq("id", chatroomId)
    .single();

  if (sessionError) {
    throw new Error("Error fetching session id");
  }

  const body = {
    ids: [session.ragflow_session_id],
  };

  try {
    const res = await fetch(`${API_URL}/v1/chats/${assistantId}/sessions`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error("Failed to delete session");

    const resJson = await res.json();
    console.log(resJson);
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
};

export const llmToChatroom = async (chatroomId: string, message: string) => {
  const supabase = await createClient();

  const { error } = await supabase.from("Messages").insert([
    {
      chatroom_id: chatroomId,
      content: message,
      is_new: false,
    },
  ]);

  if (error) {
    throw new Error("Error when sending message from LLM");
  }
};
