export async function createRagflowSession(agentId) {
  const RAGFLOW_API_URL = `https://ragflow.dev.techatnyu.org/api/v1/chats/${agentId}/sessions`;
  const API_KEY = process.env.API_KEY;

  try {
    const response = await fetch(RAGFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ name: "new session" }),
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
