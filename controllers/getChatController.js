"use server";

import { createClient } from "@/utils/supabase/server";
import { createRagflowSession } from "createRagflowSession";

const supabase = createClient();

export async function getChatSession(req, res) {
  try {
    const { userId, classroomId } = req.body;

    if (!userId || !classroomId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let { data, error } = await supabase
      .from("chat_sessions")
      .select("session_id, ragflow_session_id")
      .eq("user_id", userId)
      .eq("classroom_id", classroomId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching session:", error);
      return res.status(500).json({ error: "Failed to fetch session" });
    }

    if (data) {
      return res.json(data);
    }

    const { data: classroomData, error: classroomError } = await supabase
      .from("classrooms")
      .select("agent_id")
      .eq("id", classroomId)
      .single();

    if (classroomError || !classroomData) {
      console.error("Error fetching agent_id:", classroomError);
      return res.status(500).json({ error: "Failed to fetch agent_id" });
    }

    const agentId = classroomData.agent_id;

    const ragflowSessionId = await createRagflowSession(agentId);

    if (!ragflowSessionId) {
      return res
        .status(500)
        .json({ error: "Failed to create RAGFlow session" });
    }

    const { data: newSession, error: newSessionError } = await supabase
      .from("chat_sessions")
      .insert({
        user_id: userId,
        classroom_id: classroomId,
        ragflow_session_id: ragflowSessionId,
      })
      .select()
      .single();

    if (newSessionError) {
      console.error("Error creating session:", newSessionError);
      return res.status(500).json({ error: "Failed to create chat session" });
    }

    return res.json(newSession);
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
