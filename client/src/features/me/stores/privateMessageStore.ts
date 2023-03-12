import { defineStore } from "pinia";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import { useLoadMoreMessages } from "@/composables/useLoadMoreMessages";
import { useGetMessage } from "@/composables/useGetMessage";

interface PrivateMessageState {
  isConversationLoaded: boolean;
  messages: MessageInterface[];
  previousMessages: MessageInterface[];
  isMessagePushInArray: boolean;
  isMessagesLoaded: boolean;
  isBeginningConversation: boolean;
  error: null | string;
}

export const usePrivateMessage = defineStore("privateMessage", {
  state: (): PrivateMessageState => ({
    isConversationLoaded: false,
    isMessagesLoaded: false,
    messages: [],
    previousMessages: [],
    isMessagePushInArray: false,
    isBeginningConversation: false,
    error: null,
  }),

  getters: {},

  actions: {
    getPrivateMessageHistory(data: PrivateMessageInterface[]) {
      this.isMessagesLoaded = false;
      this.isBeginningConversation = data.length < 40;
      this.messages = data;
      this.isMessagesLoaded = true;
    },

    async loadMorePrivateMessages(data: PrivateMessageInterface[]) {
      await useLoadMoreMessages(data, this);
    },

    privateMessage(data: PrivateMessageInterface) {
      useGetMessage(data, this);
    },
  },
});
