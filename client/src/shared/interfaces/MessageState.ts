import type { MessageInterface } from "@/shared/interfaces/MessageInterface";

export interface MessageState {
  messages: MessageInterface[];
  previousMessages: MessageInterface[];
  isMoreMessagesLoaded: boolean;
  isBeginningConversation: boolean;
  isMessagePushInArray: boolean;
  isMessagesLoaded: boolean;
}
