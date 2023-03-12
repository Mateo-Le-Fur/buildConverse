import { defineStore } from "pinia";

import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import { useGetMessage } from "@/composables/useGetMessage";
import { useLoadMoreMessages } from "@/composables/useLoadMoreMessages";
import type { MessageState } from "@/shared/interfaces/MessageState";

export const useMessage = defineStore("message", {
  state: (): MessageState => ({
    messages: [],
    previousMessages: [],
    isMessagePushInArray: false,
    isBeginningConversation: false,
    isMessagesLoaded: false,
  }),

  actions: {
    getHistory(data: MessageInterface[]) {
      this.isMessagesLoaded = false;
      this.isBeginningConversation = data.length < 40;
      this.messages = data;
      this.isMessagesLoaded = true;
    },

    getMessage(data: MessageInterface) {
      useGetMessage(data, this);
    },

    async loadMoreMessages(data: MessageInterface[]) {
      await useLoadMoreMessages(data, this);
    },
  },
});
