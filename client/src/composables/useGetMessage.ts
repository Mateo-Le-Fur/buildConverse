import { onMounted, onUnmounted, ref } from "vue";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import { useChat } from "@/shared/stores/chatStore";
import type { MessageState } from "@/shared/interfaces/MessageState";
import type { MeState } from "@/shared/interfaces/meState";

export function useGetMessage<
  Type extends MessageInterface | PrivateMessageInterface
>(message: Type, store: MessageState | MeState) {
  const chatStore = useChat();

  if (store.messages.length >= 100) store.messages.pop();

  if (chatStore.page === 1) {
    store.messages.push(message);
    store.messages.sort((a, b) => b.id - a.id);
  } else if (chatStore.page === 0) {
    store.messages.push(message);
  }

  store.isMessagePushInArray = true;
}
