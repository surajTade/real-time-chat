import { Chat, Store, UserId } from "./Store";

export interface Room {
  roomId: string;
  chats: Chat[];
}

export class InMemoryStore implements Store {
  private roomStore: Map<string, Room>;

  constructor() {
    this.roomStore = new Map<string, Room>();
  }

  initRoom(roomId: string): void {
    this.roomStore.set(roomId, {
      roomId,
      chats: [],
    });
  }

  getChats(roomId: string, limit: number, offset: number): Chat[] {
    const room = this.getRoom(roomId);
    if (!room) {
      this.logError(`Room with ID ${roomId} does not exist.`);
      return [];
    }

    const startIndex = Math.max(room.chats.length - offset - limit, 0);
    const endIndex = room.chats.length - offset;
    return room.chats.slice(startIndex, endIndex);
  }

  addChat(
    roomId: string,
    userId: UserId,
    name: string,
    message: string
  ): string {
    let room = this.getRoom(roomId);
    if (!room) {
      this.initRoom(roomId);
      this.logInfo(`RoomId ${roomId} does not exist, creating new room.`);
    }

    room = this.getRoom(roomId)!;

    const chatId = this.createChat(room, userId, name, message);
    return chatId;
  }

  upVote(userId: UserId, roomId: string, chatId: string): number {
    const room = this.getRoom(roomId);
    if (!room) return 0;

    const chat = this.findChatById(room, chatId);
    if (chat) {
      if (!chat.upvotes.includes(userId)) {
        chat.upvotes.push(userId);
      } else {
        this.logError(
          `User ${userId} has already upvoted chat ${chatId} in room ${roomId}.`
        );
      }
    } else {
      this.logError(`Chat with ID ${chatId} not found in room ${roomId}.`);
      return 0;
    }

    return chat?.upvotes.length;
  }

  private getRoom = (roomId: string) => {
    const room = this.roomStore.get(roomId);
    if (!room) {
      this.logError(
        `Room with ID ${roomId} does not exist while attempting to retrieve it.`
      );
    }
    return room;
  };

  private findChatById = (room: Room, chatId: string) => {
    const chat = room.chats.find(({ id }) => id === chatId);
    if (!chat) {
      this.logError(
        `Chat with ID ${chatId} does not exist in room ${room.roomId}.`
      );
    }
    return chat;
  };

  private createChat = (
    room: Room,
    userId: UserId,
    name: string,
    message: string
  ): string => {
    const chat: Chat = {
      id: this.generateUniqueId(),
      name,
      userId,
      message,
      upvotes: [],
    };
    room.chats.push(chat);
    return chat.id;
  };

  private generateUniqueId = (): string => {
    return `${this.getRandomSegment()}-${this.getRandomSegment()}-${this.getRandomSegment()}`;
  };

  private getRandomSegment = (): string => {
    return Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
  };

  private logError = (message: string): void => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`);
  };

  private logInfo = (message: string): void => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
  };
}
