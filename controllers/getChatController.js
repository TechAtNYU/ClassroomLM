import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


export async function getOrCreateChatSession(req, res) {
    try {
        const { userId, classroomId } = req.body;

        if (!userId || !classroomId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        let { data, error } = await supabase
            .from('chat_sessions')
            .select('session_id')
            .eq('user_id', userId)
            .eq('classroom_id', classroomId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching session:", error);
            return res.status(500).json({ error: "Failed to fetch session" });
        }

        if (!data) {
            const { data: newSession, error: newSessionError } = await supabase
                .from('chat_sessions')
                .insert({ user_id: userId, classroom_id: classroomId })
                .select()
                .single();

            if (newSessionError) {
                console.error("Error creating session:", newSessionError);
                return res.status(500).json({ error: "Failed to create session" });
            }
            data = newSession;
        }

        return res.json(data);
    } catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
