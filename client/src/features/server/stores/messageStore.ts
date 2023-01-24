import { defineStore } from "pinia";

import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import { useGetMessage } from "@/composables/useGetMessage";
import { useLoadMoreMessage } from "@/composables/useLoadMoreMessage";
import type { MessageState } from "@/shared/interfaces/MessageState";

export const useMessage = defineStore("message", {
  state: (): MessageState => ({
    messages: [],
    previousMessages: [],
    isMoreMessagesLoaded: false,
    isMessagePushInArray: false,
    isBeginningConversation: false,
    isMessagesLoaded: false,
  }),

  actions: {
    getHistory(data: MessageInterface[]) {
      this.isMessagesLoaded = false;
      this.isBeginningConversation = data.length < 100;
      this.messages = data;
      this.isMessagesLoaded = true;
    },

    getMessage(data: MessageInterface) {
      useGetMessage(data, this);
    },

    loadMoreMessages(data: MessageInterface[]) {
      useLoadMoreMessage(data, this);
    },
  },
});
