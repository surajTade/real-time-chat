import z from "zod";

export enum supportedMessages {
  JoinRoom = "JOIN_ROOM",
  SendMessage = "SEND_MESSAGES",
  UpvoteMessage = "UPVOTE_MESSAGE",
}

export const initMessage = z.object({
  name: z.string(),
  userId: z.string(),
  roomId: z.string(),
});

export type InitMessageType = z.infer<typeof initMessage>;

export const userMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  message: z.string(),
});

export type UserMessageType = z.infer<typeof userMessage>;

export const upvoteMessage = z.object({
  userId: z.string(),
  roomId: z.string(),
  chatId: z.string(),
});

export type upvoteMessageType = z.infer<typeof upvoteMessage>;

export type IncomingMessage =
  | {
      type: supportedMessages.JoinRoom;
      payload: InitMessageType;
    }
  | {
      type: supportedMessages.SendMessage;
      payload: UserMessageType;
    }
  | {
      type: supportedMessages.UpvoteMessage;
      payload: upvoteMessageType;
    };
