export type UserId = string;

export interface Chat {
  id: string; // Unique identifier for the chat
  name: string; // Name of the user who sent the chat
  userId: UserId; // ID of the user who sent the chat
  message: string; // Content of the chat message
  upvotes: UserId[]; // List of user IDs who have upvoted this chat
}

/**
 * Abstract class representing a store for chat rooms.
 */
export abstract class Store {
  /**
   * Initializes a new room with the given ID.
   * @param roomId - The ID of the room to initialize.
   */
  abstract initRoom(roomId: string): void;

  /**
   * Retrieves a list of chats in the specified room.
   * @param roomId - The ID of the room to get chats from.
   * @param limit - The maximum number of chats to return.
   * @param offset - The number of chats to skip before starting to collect the result set.
   */
  abstract getChats(roomId: string, limit: number, offset: number): Chat[];

  /**
   * Adds a new chat to the specified room.
   * @param roomId - The ID of the room to add the chat to.
   * @param userId - The ID of the user sending the chat.
   * @param name - The name of the user sending the chat.
   * @param message - The content of the chat message.
   */
  abstract addChat(
    roomId: string,
    userId: UserId,
    name: string,
    message: string
  ): string;

  /**
   * Upvotes a chat in the specified room.
   * @param userId - The ID of the user who is upvoting the chat.
   * @param roomId - The ID of the room containing the chat to be upvoted.
   * @param chatId - The ID of the chat to be upvoted.
   */
  abstract upVote(userId: UserId, roomId: string, chatId: string): number;
}
