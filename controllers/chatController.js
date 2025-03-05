export default async function chatController(classroom_id, sessionId, prompt) {
  const RAGFLOW_API_URL = `https://ragflow.dev.techatnyu.org//api/v1/chats/${classroom_id}/completions`;
  const API_KEY = process.env.API_KEY;

  try {
    // const { sessionId, prompt } = req.body;

    if (!sessionId || !prompt) {
      return res.status(400).json({ error: "Missing sessionId or prompt" });
    }

    console.log(
      `Processing chat for session: ${sessionId} with prompt: ${prompt}`
    );

    const response = await fetch(RAGFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: {
        session_id: sessionId,
        question: prompt,
      },
    });
    if (!response) {
      return { session: 0, error: 1 };
      // return res.status(500).json({ error: "Failed to process request with RAGFlow" });
    }
    console.log(response.data.answer);
    return json({ sessionId, response });
  } catch (error) {
    console.error("Error in chatController:", error);
    return { session: 0, error: 1 };
    // return res.status(500).json({ error: "Internal server error" });
  }
}
