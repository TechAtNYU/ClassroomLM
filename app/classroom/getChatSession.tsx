import { createClient } from "@/utils/supabase/server";
import { getCurrentUserId } from "./actions";
import { getRagflowDatasetId } from "../chat/[classroomId]/actions";
"use server";

async function createRagflowSession(agentId: string) {
    const RAGFLOW_API_URL = `https://ragflow.dev.techatnyu.org/api/v1/chats/${agentId}/sessions`;
    const API_KEY = process.env.RAGFLOW_API_KEY;

    try {
        const response = await fetch(RAGFLOW_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({ name: "new session" })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error("RAGFlow API Error:", result);
            return null;
        }
        return result.data.id;
    } catch (error) {
        console.error("Failed to create RAGFlow session:", error);
        return null;
    }
}

export async function getOrCreateChatSession(classroomId: number) {
    try {
        const supabase = await createClient();
        const userId = await getCurrentUserId();

        const datasetId = await getRagflowDatasetId(classroomId);

        if (!datasetId) {
            throw new Error("No RagFlow dataset found for the classroom.");
        }
        
        const { data: classroomMember, error: sessionError } = await supabase
            .from("Classroom_Members")
            .select("ragflow_session_id")
            .eq("classroom_id", classroomId)
            .eq("user_id", userId)
            .single();
        
        if (!sessionError && classroomMember?.ragflow_session_id) {
            return classroomMember.ragflow_session_id;
        }

        const newSessionId = await createRagflowSession(datasetId);
        
        if (!newSessionId) {
            throw new Error("Failed to create chat session");
        }

        await supabase
            .from("Classroom_Members")
            .update({ ragflow_session_id: newSessionId })
            .eq("classroom_id", classroomId)
            .eq("user_id", userId);

        
        return newSessionId;
    } catch (error) {
        console.error("Error setting up chat session:", error);
        throw error;
    }
}
