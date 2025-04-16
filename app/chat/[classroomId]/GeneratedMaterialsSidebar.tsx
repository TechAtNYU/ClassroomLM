"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"; // adjust path per your project

type Session = {
  id: string;
  name: string;
  messages: { role: string; content: string }[];
};

interface GeneratedMaterialsSidebarProps {
  assistantId: string;
  realUserId: string;
}

export default function GeneratedMaterialsSidebar({
  assistantId,
}: GeneratedMaterialsSidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    async function fetchSessions() {
      try {
        // Use your existing API route to get sessions.
        const res = await fetch(
          `/api/chat?method=get_sessions&id=${assistantId}`
        );
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(
            `Failed to fetch sessions: ${res.status} ${errorText}`
          );
        }
        const data = await res.json();
        setSessions(data);
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    }
    if (isSidebarOpen) {
      fetchSessions();
    }
  }, [isSidebarOpen, assistantId]);

  return (
    <>
      {/* Toggle the sidebar on button click */}
      <button
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="fixed right-4 top-4 z-50 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Sessions
      </button>

      {/* Sidebar Panel – always rendered for animation */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-80 transform overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Chat Sessions</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-red-500"
          >
            Close
          </button>
        </div>
        {sessions.length === 0 ? (
          <p>No sessions found.</p>
        ) : (
          <div>
            {/* Wrap the ul in a div to avoid nesting error */}
            <div>
              <ul className="space-y-2">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="w-full text-left text-blue-600 underline"
                    >
                      {session.name || session.id}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Modal for Session Details – slide in from the right */}
      <Dialog
        open={!!selectedSession}
        onOpenChange={() => setSelectedSession(null)}
      >
        <div
          className={`fixed inset-0 flex transform items-center justify-center transition-transform duration-300 ${
            selectedSession ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <DialogContent className="max-h-[80vh] max-w-md overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedSession?.name || "Session Details"}
              </DialogTitle>
              <DialogDescription>
                {selectedSession?.messages.length ? (
                  <div>
                    <ul className="space-y-2">
                      {selectedSession.messages.map((msg, index) => (
                        <li key={index} className="rounded border p-2">
                          <strong>{msg.role}:</strong> {msg.content}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>No messages in this session.</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <DialogClose asChild>
                <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  Close
                </button>
              </DialogClose>
            </div>
          </DialogContent>
        </div>
      </Dialog>
    </>
  );
}
