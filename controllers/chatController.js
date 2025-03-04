import { ragflow } from '../services/ragflowService.js';

export default async function chatController(sessionId, prompt) {
    try {
        // const { sessionId, prompt } = req.body;

        if (!sessionId || !prompt) {
            return res.status(400).json({ error: "Missing sessionId or prompt" });
        }

        console.log(`Processing chat for session: ${sessionId} with prompt: ${prompt}`);

        const response = await ragflow(sessionId, prompt);

        if (!response) {
            return {session: 0, error: 1};
            // return res.status(500).json({ error: "Failed to process request with RAGFlow" });
        }

        return json({ sessionId, response });

    } catch (error) {
        console.error("Error in chatController:", error);
        return {session: 0, error: 1};
        // return res.status(500).json({ error: "Internal server error" });
    }
}
