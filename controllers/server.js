import express from 'express';
import dotenv from 'dotenv';
import { getOrCreateChatSession } from './getChatController.js';

dotenv.config();

const app = express();
app.use(express.json());

app.post('/api/get-chat-session', getOrCreateChatSession);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/*
44444
907d87c4-43b2-461e-b558-30f2fb27a1cf

=> 42f1dee0-b6fe-451f-acc8-458903c14f49
*/
