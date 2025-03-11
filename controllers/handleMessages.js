import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = await createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function handleMessage(req, res) {
  try {

    const sessionID = req.query.sessionID;
    const message = req.query.message;

    let { data, error } = await supabase
    .from("chat_sessions")
    .select()
    .eq("session_id", sessionID);

    let msgs = data[0].client_messages;

    if (message != null){
        msgs.push(message);
        const { error1 } = await supabase
        .from("chat_sessions")
        .update({ client_messages: msgs})
        .eq("session_id", sessionID)
    }

    res.send(msgs);
    res.status(200);

  } catch (error) {
      console.error("Error locating session:", error);
      return res.status(500).json({ error: "Failed to locate session" });
  }
}