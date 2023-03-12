import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import { useChat } from "@/shared/stores/chatStore";
import type { MessageState } from "@/shared/interfaces/MessageState";
import type { MeState } from "@/shared/interfaces/meState";
import type { StoreGeneric } from "pinia";

interface MessageStore extends StoreGeneric, MessageState {}

interface MeStore extends StoreGeneric, MeState {}

export function useGetMessage<
  Type extends MessageInterface | PrivateMessageInterface
>(message: Type, store: MessageStore | MeStore) {
  const chatStore = useChat();

  store.$patch((state) => {
    if (state.messages.length >= 100) store.messages.pop();

    if (chatStore.page <= 1) {
      state.messages.push(message);
      state.messages.sort(
        (
          a: MessageInterface | PrivateMessageInterface,
          b: MessageInterface | PrivateMessageInterface
        ) => b.id - a.id
      );
    }
    state.isMessagePushInArray = true;
  });
}
