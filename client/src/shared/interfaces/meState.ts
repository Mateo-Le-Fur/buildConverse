import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";

export interface MeState {
  friends: FriendsInterface[] | any[];
  recipients: RecipientInterface[];
  currentRecipient: RecipientInterface | null;
  isConversationLoaded: boolean;
  messages: MessageInterface[];
  previousMessages: MessageInterface[];
  isMessagePushInArray: boolean;
  isMessagesLoaded: boolean;
  isMoreMessagesLoaded: boolean;
  isBeginningConversation: boolean;
  error: null | string;
}
