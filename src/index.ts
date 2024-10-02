#!/usr/bin/env node
import {
  outgoingMessage,
  supportedMessages as outgoingSupportedMessage,
} from "./messages/OutgoingMessages";
import { connection, server as WebSocketServer } from "websocket";
import {
  IncomingMessage,
  supportedMessages,
} from "./messages/IncomingMessages";
import { UserManager } from "./UserManager";
import { InMemoryStore } from "./store/InMemoryStore";
import http from "http";

const PORT = 8080;

const server = http.createServer((request, response) => {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(PORT, () => {
  console.log(new Date() + ` Server is listening on port ${PORT}`);
});

const userManager = new UserManager();
const store = new InMemoryStore();

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

function originIsAllowed(origin: string): boolean {
  // Implement your origin checking logic here
  return true;
}

wsServer.on("request", (request) => {
  if (!originIsAllowed(request.origin)) {
    request.reject();
    console.log(
      new Date() + " Connection from origin " + request.origin + " rejected."
    );
    return;
  }

  const connection = request.accept("echo-protocol", request.origin);
  console.log(new Date() + " Connection accepted.");

  connection.on("message", (message) => {
    if (message.type === "utf8") {
      try {
        const parsedMessage: IncomingMessage = JSON.parse(message.utf8Data);
        messageHandler(connection, parsedMessage);
      } catch (error) {
        console.error(new Date() + " Error parsing message:", error);
      }
    }
  });
});

const messageHandler = (socket: connection, message: IncomingMessage) => {
  try {
    switch (message.type) {
      case supportedMessages.JoinRoom:
        const joinPayload = message.payload;
        userManager.addUser(
          joinPayload.name,
          joinPayload.userId,
          joinPayload.roomId,
          socket
        );
        break;

      case supportedMessages.SendMessage:
        const sendPayload = message.payload;
        const user = userManager.getUserInRoom(
          sendPayload.roomId,
          sendPayload.userId
        );
        if (user) {
          const chatId = store.addChat(
            sendPayload.roomId,
            sendPayload.userId,
            user.name,
            sendPayload.message
          );

          if (chatId) {
            const outgoingPayload: outgoingMessage = {
              type: outgoingSupportedMessage.AddChat,
              payload: {
                roomId: sendPayload.roomId,
                chatId: chatId,
                message: sendPayload.message,
                name: user.name,
                upvotes: 0,
              },
            };
            userManager.broadcast(
              sendPayload.roomId,
              sendPayload.userId,
              outgoingPayload
            );
          }
        }
        break;

      case supportedMessages.UpvoteMessage:
        const upvotePayload = message.payload;
        const upvotes = store.upVote(
          upvotePayload.userId,
          upvotePayload.roomId,
          upvotePayload.chatId
        );

        const outgoingUpvotePayload: outgoingMessage = {
          type: outgoingSupportedMessage.UpdateChat,
          payload: {
            roomId: upvotePayload.roomId,
            chatId: upvotePayload.chatId,
            upvotes,
          },
        };
        userManager.broadcast(
          upvotePayload.roomId,
          upvotePayload.userId,
          outgoingUpvotePayload
        );
        break;

      default:
        console.warn(new Date() + " Unsupported message type");
    }
  } catch (error) {
    console.error(new Date() + " Error handling message:", error);
  }
};

// Graceful shutdown
process.on("SIGINT", () => {
  console.log(new Date() + " Shutting down server...");
  server.close(() => {
    console.log(new Date() + " Server shut down.");
    process.exit(0);
  });
});
