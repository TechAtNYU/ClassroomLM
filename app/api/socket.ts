import type { NextApiRequest } from "next";
import type { NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket } from "net";
import { Server } from "socket.io";

// augments response type to include `socket.server.io`
type NextApiResponseWithSocket = NextApiResponse & {
  socket: Socket & {
    server: HTTPServer & {
      io?: Server;
    };
  };
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  // if `io` isn't already set up, create a new instance
  if (!res.socket.server.io) {
    console.log("Initializing Socket.io server...");
    const io = new Server(res.socket.server);

    // attach `io` to the server so it persists across requests
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("New client connected: " + socket.id);

      // listen for incoming messages and broadcast them
      socket.on("message", (msg: string) => {
        io.emit("message", msg);
      });
    });
  }

  // end the API route without returning JSON
  res.end();
}
