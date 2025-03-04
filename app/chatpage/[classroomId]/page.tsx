"use client";

import getOrCreateChatSession from "@/controllers/getChatController";
import chatController from "@/controllers/chatController";
import { UUID } from "crypto";
//import { getCurrentUserId } from "../lib/supabase-api";

export default function Home({ params }: { params: { classroomId: number } }) {
  let sessionID: UUID;

  async function startSession() {
    // get the two params
    //What should be implemented later
    // const userID = getCurrentUserId();
    const classroomID = params.classroomId;

    const userID = document.getElementById("userId");

    //let classroomID = document.getElementById("classroomID");

    const sessionIDResponse = await getOrCreateChatSession(userID, classroomID);

    sessionID = sessionIDResponse.session;

    const infoDisplay = document.getElementById("informationInput");

    if (infoDisplay != null) {
      infoDisplay.style.display = "none";
    }

    const promptDisplay = document.getElementById("promptInput");

    if (promptDisplay != null) {
      promptDisplay.style.display = "none";
    }
  }

  async function sendChat() {
    // get the two params
    const prompt = document.getElementById("prompt");

    const promptResponse = await chatController(sessionID, prompt);

    const response = promptResponse.response;

    const responseDisplay = document.getElementById("responses");

    if (responseDisplay != null) {
      responseDisplay.textContent += "\n" + response;
    }
  }

  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <div className="text-center font-[family-name:var(--font-geist-mono)] sm:text-left">
          <div id="informationInput">
            <h1 className="mb-2">
              Enter User ID (this will eventually be known, user will not need
              to enter it)
            </h1>
            <input
              type="text"
              id="userID"
              className="rounded-md border-2 border-white bg-black p-1 font-[family-name:var(--font-geist-mono)]"
            ></input>

            <h1 className="mb-2">
              Enter Classroom ID (this will eventually be known, user will not
              need to enter it)
            </h1>

            <input
              type="text"
              id="classroomID"
              className="rounded-md border-2 border-white bg-black p-1 font-[family-name:var(--font-geist-mono)]"
            ></input>

            <button
              onClick={startSession}
              className="ml-2 rounded-md border-2 border-white bg-black p-1 font-[family-name:var(--font-geist-mono)]"
            >
              Start Chat
            </button>
          </div>

          <div id="promptInput" className="hidden">
            <h1 id="responses" className="mb-2"></h1>

            <h1 className="mb-2">Enter Prompt</h1>

            <input
              type="text"
              id="prompt"
              className="rounded-md border-2 border-white bg-black p-1 font-[family-name:var(--font-geist-mono)]"
            ></input>

            <button
              onClick={sendChat}
              className="ml-2 h-10 w-20 rounded-md border-2 border-white bg-black p-1 font-[family-name:var(--font-geist-mono)]"
            >
              Send Message
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row"></div>
      </main>
    </div>
  );
}
