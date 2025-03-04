import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';



dotenv.config();

// const supabase = createClient("https://ixpqbkoedadzmydvyfvo.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cHFia29lZGFkem15ZHZ5ZnZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MzExOTgsImV4cCI6MjA1NjEwNzE5OH0._gOWyrWDqueM8_AMhPoYU2Fkhhs49PXi3tjXZ71mjgg");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);


export default async function getOrCreateChatSession(userId, classroomId) {
    try {
        // const { userId, classroomId } = req.body;

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
            return {session: 0, error: 1};
            // return res.status(500).json({ error: "Failed to fetch session" });
        }

        if (!data) {
            const { data: newSession, error: newSessionError } = await supabase
                .from('chat_sessions')
                .insert({ user_id: userId, classroom_id: classroomId })
                .select()
                .single();

            if (newSessionError) {
                console.error("Error creating session:", newSessionError);
                return {session: 0, error: 1};
                // return res.status(500).json({ error: "Failed to create session" });
            }
            data = newSession;
        }

        return res.json(data);
    } catch (error) {
        console.error("Unexpected error:", error);
        return {session: 0, error: 1};
    }
}
