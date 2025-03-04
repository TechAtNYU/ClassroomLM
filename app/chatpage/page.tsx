"use client";

import getOrCreateChatSession from '@/controllers/getChatController';
import chatController from '@/controllers/chatController';
import { UUID } from 'crypto';

export default function Home() {

  let sessionID: UUID;

  async function startSession() {
    
    // get the two params
    let userID = document.getElementById("userID");

    let classroomID = document.getElementById("classroomID");

    let sessionIDResponse = await getOrCreateChatSession(userID, classroomID);

    sessionID = sessionIDResponse.session;

    let infoDisplay = document.getElementById("informationInput");

    if (infoDisplay != null){
      infoDisplay.style.display = "none";
    }

    let promptDisplay = document.getElementById("promptInput");

    if (promptDisplay != null){
      promptDisplay.style.display = "none";
    }
  }

  async function sendChat() {
    
    // get the two params
    let prompt = document.getElementById("prompt");

    let promptResponse = await chatController(sessionID, prompt);

    let response = promptResponse.response;


    let responseDisplay = document.getElementById("responses");

    if (responseDisplay != null){
      responseDisplay.textContent += '\n' + response;
    }
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="text-center sm:text-left font-[family-name:var(--font-geist-mono)]">

          <div id="informationInput">
            <h1 className="mb-2">
              Enter User ID (this will eventually be known, user won't need to enter it)
            </h1>
            <input type="text"  id="userID" className="bg-black border-2 rounded-md border-white font-[family-name:var(--font-geist-mono)] p-1"></input>
            
            <h1 className="mb-2">
              Enter Classroom ID (this will eventually be known, user won't need to enter it)
            </h1>
            
            <input type="text" id="classroomID" className="bg-black border-2 rounded-md border-white font-[family-name:var(--font-geist-mono)] p-1"></input>

            <button onClick={startSession} className="bg-black border-2 rounded-md border-white font-[family-name:var(--font-geist-mono)] p-1 ml-2">
              Start Chat
            </button>
          </div>

          <div id="promptInput" className="hidden">

            <h1 id="responses" className="mb-2">
              
            </h1>

            <h1 className="mb-2">
              Enter Prompt
            </h1>

            <input type="text" id="prompt" className="bg-black border-2 rounded-md border-white font-[family-name:var(--font-geist-mono)] p-1"></input>

            <button onClick={sendChat} className="bg-black border-2 rounded-md border-white font-[family-name:var(--font-geist-mono)] p-1 ml-2 w-20 h-10">
              Send Message
            </button>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">

        </div>
      </main>
    </div>
  );
}