import { UserId } from "./store/Store";
import { outgoingMessage } from "./messages/OutgoingMessages";
import { connection } from "websocket";

export interface User {
  userId: UserId;
  name: string;
  socket: connection;
}

interface Room {
  users: User[];
}

export class UserManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map<string, Room>();
  }

  private ensureRoomExists(roomId: string): Room {
    let room = this.rooms.get(roomId);
    if (!room) {
      room = { users: [] };
      this.rooms.set(roomId, room);
      console.info(`Room ${roomId} created.`);
    }
    return room;
  }

  addUser(
    name: string,
    userId: UserId,
    roomId: string,
    socket: connection
  ): void {
    const room = this.ensureRoomExists(roomId);

    if (room.users.some((user) => user.userId === userId)) {
      console.warn(`User ${userId} is already in room ${roomId}.`);
      return; // User already exists, no need to add
    }

    room.users.push({ userId, name, socket });
    console.info(`User ${name} added to room ${roomId}.`);
  }

  removeUser(roomId: string, userId: UserId): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      console.warn(
        `Attempted to remove user ${userId} from non-existent room ${roomId}.`
      );
      return;
    }

    room.users = room.users.filter((user) => user.userId !== userId);

    if (room.users.length === 0) {
      this.rooms.delete(roomId);
      console.info(`Room ${roomId} deleted as it is now empty.`);
    } else {
      console.info(`User ${userId} removed from room ${roomId}.`);
    }
  }

  getUsersInRoom(roomId: string): User[] {
    const room = this.rooms.get(roomId);
    return room ? room.users : [];
  }

  getUserInRoom(roomId: string, reqUserId: UserId): User | null {
    return (
      this.rooms
        .get(roomId)
        ?.users.find(({ userId }) => userId === reqUserId) || null
    );
  }

  isUserInRoom(userId: UserId, roomId: string): boolean {
    return (
      this.rooms.get(roomId)?.users.some((user) => user.userId === userId) ||
      false
    );
  }

  broadcast(roomId: string, userId: UserId, message: outgoingMessage): void {
    const room = this.rooms.get(roomId);
    const user = this.getUserInRoom(roomId, userId);

    if (!user) {
      console.warn(`User ${userId} not found in room ${roomId}.`);
      return;
    }

    if (!room) {
      console.warn(`Room ${roomId} not found for broadcast.`);
      return;
    }

    room.users.forEach(({ socket }) => {
      try {
        socket.sendUTF(JSON.stringify({ message }));
      } catch (error) {
        console.error(
          `Failed to send message to socket of user ${user.userId} in room ${roomId}:`,
          error
        );
      }
    });
  }
}
