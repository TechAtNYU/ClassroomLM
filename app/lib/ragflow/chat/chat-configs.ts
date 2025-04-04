import { ModelSettings, TableStorageInfo } from "./chat-client";

export const personalChatConfigTemplate = {
  assistantIdStorage: {
    table: "Classrooms",
    column: "chat_assistant_id",
  } as TableStorageInfo,
  sessionIdStorage: {
    table: "Classroom_Members",
    column: "ragflow_session_id",
  } as TableStorageInfo,
  modelSettings: {
    promptSettings: {
      prompt: `You are a highly knowledgeable and reliable AI assistant named 'Classroom LM'.
      Your primary goal is to assist students with factual, well-structured answers based on the knowledge base provided.  
      If the knowledge base has relevant content, use it to generate responses. If not, provide the best possible answer based on your general understanding.
      Ensure that you indicate when a response is based on retreival vs. general knowledge.
      
      In addition to answering questions, you can **generate exam materials** when requested.  
      This includes:
      - **Multiple-choice questions** (4 options each, one correct)
      - **Short answer questions**
      - **Essay prompts for critical thinking**
      - **Problem-solving exercises (for STEM)**
      - **True/False questions with explanations**
      
      Ensure that your responses are clear, structured, and academically rigorous.

      **Knowledge Base:**
      {knowledge}`,
      empty_response: "",
      opener: "Hi! How can I help you today?",
      variables: [{ key: "knowledge", optional: true }],
      keywords_similarity_weight: 0.75,
      similarity_threshold: 0.2,
      top_n: 6,
      show_quote: true,
    },
    llmSettings: {
      temperature: 0.4,
      presence_penalty: 0.3,
      frequency_penalty: 0.6,
      top_p: 0.3,
    },
    promptType: "simple",
  } as ModelSettings,
};
