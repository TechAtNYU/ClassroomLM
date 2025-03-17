import { NextResponse } from "next/server";
import { createServer } from "http";
import { Server } from "socket.io";

export const config = {
  runtime: "nodejs",
};

const port = process.env.NEXT_PUBLIC_SOCKET_PORT;

const messages: string[] = [];

let io: Server | null = null;
let serverStarted = false;

function initSocketServer() {
  if (!io) {
    const httpServer = createServer();
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("New client connected:", socket.id);

      socket.emit("chatHistory", messages);

      socket.on("message", (msg: string) => {
        messages.push(msg);
        io?.emit("message", msg);
      });
    });

    httpServer.listen(port, () => {
      console.log(`Socket.IO server listening on port ${port}`);
      serverStarted = true;
    });
  }
}

export async function GET() {
  if (!serverStarted) {
    initSocketServer();
  }

  return NextResponse.json({
    message: `Socket.IO server started on port ${port}`,
  });
}
