import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import { useChat } from "@/shared/stores/chatStore";
import type { MessageState } from "@/shared/interfaces/MessageState";
import type { MeState } from "@/shared/interfaces/meState";
import type { StoreGeneric } from "pinia";

interface MessageStore extends StoreGeneric, MessageState {}

interface MeStore extends StoreGeneric, MeState {}

export function useLoadMoreMessage<
  Type extends MessageInterface | PrivateMessageInterface
>(message: Type[], store: MessageStore | MeStore) {
  const chatStore = useChat();

  // Si le début de la conversation est atteint et que l'on redescend alors on retourne au début des messages
  if (store.isBeginningConversation) {
    store.$reset();
    store.messages = message;
    store.isMessagesLoaded = true;
    chatStore.resetChat();
    return;
  }

  store.isBeginningConversation = message.length < 50;

  if (!message.length) return;

  const start =
    !chatStore.isChangeDirectionToGoDown && !chatStore.isChangeDirectionToGoUp
      ? store.messages.length / 2
      : 0;
  const count =
    !chatStore.isChangeDirectionToGoDown && !chatStore.isChangeDirectionToGoUp
      ? store.messages.length
      : message.length;

  store.previousMessages = store.messages.splice(start, count);

  store.messages = [...store.previousMessages, ...message];

  store.isMoreMessagesLoaded = true;
}
