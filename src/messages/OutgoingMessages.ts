export enum supportedMessages {
  AddChat = "ADD_CHAT",
  UpdateChat = "UPDATE_CHAT",
}

type messagePayload = {
  roomId: string;
  chatId: string;
  message: string;
  name: string;
  upvotes: number;
};

export type outgoingMessage =
  | {
      type: supportedMessages.AddChat;
      payload: messagePayload;
    }
  | {
      type: supportedMessages.UpdateChat;
      payload: Partial<messagePayload>;
    };
