import { defineStore } from "pinia";
import { useSocket } from "@/shared/stores/socketStore";
import type { Ref } from "vue";
import { ref } from "vue";
import type { Message } from "@/shared/interfaces/Message";

interface ChatState {
  element: Ref<HTMLDivElement | null>;
  oldHeight: Ref<number | undefined>;
}

export const useChat = defineStore("chat", {
  state: (): ChatState => ({
    element: ref(null),
    oldHeight: ref(),
  }),

  getters: {},

  actions: {
    init(element: HTMLDivElement | null) {
      this.element = element;
    },

    scrollToBottomOnMounted() {
      const scrollHeight = this.element?.scrollHeight;

      this.element?.scrollTo({
        top: scrollHeight,
        left: 0,
      });

      this.oldHeight = scrollHeight;
    },

    scrollToBottom() {
      this.element?.scrollTo({
        top: this.element?.scrollHeight,
        left: 0,
      });
    },

    loadMoreMessages(
      e: Event,
      socketEventName: string,
      messagesArrayLength: number,
      id: number
    ) {
      const socketStore = useSocket();

      const target = e.target as HTMLDivElement;
      if (target.scrollTop <= 0) {
        socketStore.ioClient?.emit(socketEventName, {
          messagesArrayLength,
          id,
        });
      }
    },

    newMessagesLoaded() {
      this.element?.scrollTo({
        top: this.element.scrollHeight - this.oldHeight!,
        left: 0,
      });

      this.oldHeight = this.element?.scrollHeight;
    },

    filteredMessages(messages: any[]) {
      return messages
        .sort((a, b) => a.id - b.id)
        .map((message, index) => {
          const previous = messages[index - 1];
          const showAvatar = this.shouldShowAvatar(previous, message);

          if (showAvatar) {
            return message;
          } else {
            return {
              ...message,
              avatarAuthor: null,
            };
          }
        });
    },

    shouldShowAvatar(previous: Message, message: Message) {
      const isFirst = !previous;
      if (isFirst) return true;

      const differentUser = message.authorName !== previous.authorName;
      if (differentUser) return true;
    },
  },
});
