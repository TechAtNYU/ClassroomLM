import { ragflow } from '../services/ragflowService.js';

export async function chatController(req, res) {
    try {
        const { sessionId, prompt } = req.body;

        if (!sessionId || !prompt) {
            return res.status(400).json({ error: "Missing sessionId or prompt" });
        }

        console.log(`Processing chat for session: ${sessionId} with prompt: ${prompt}`);

        const response = await ragflow(sessionId, prompt);

        if (!response) {
            return res.status(500).json({ error: "Failed to process request with RAGFlow" });
        }

        return res.json({ sessionId, response });

    } catch (error) {
        console.error("Error in chatController:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
