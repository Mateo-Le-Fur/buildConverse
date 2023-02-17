import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import { useChat } from "@/shared/stores/chatStore";
import type { MessageState } from "@/shared/interfaces/MessageState";
import type { MeState } from "@/shared/interfaces/meState";
import type { StoreGeneric } from "pinia";
import { nextTick } from "vue";

interface MessageStore extends StoreGeneric, MessageState {}

interface MeStore extends StoreGeneric, MeState {}

export async function useLoadMoreMessages<
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

  // const notChangeDirection =
  //   !chatStore.isChangeDirectionToGoDown && !chatStore.isChangeDirectionToGoUp;
  /* On vérifie si l'utilisateur n'a pas changé de direction lorsqu'il scroll dans le chat.
   * Par exemple s'il monte jusqu'à la page 4 et qu'il redescend d'une page il ne faut pas
   * qu'il descende à la page 3, car on dispose déjà des messages de cette page dans notre
   * tableau de 'previousMessages' donc il faut récupérer les messages de la page 2 */
  // const start = notChangeDirection ? store.messages.length / 2 : 0;
  // const count = notChangeDirection ? store.messages.length : message.length;

  const arrayLength = store.messages.length;
  const midArrayLength = store.messages.length / 2;

  const start = chatStore.direction === "up" ? midArrayLength : 0;
  const count = chatStore.direction === "up" ? arrayLength : midArrayLength;

  const index = chatStore.direction === "up" ? -1 : 0;
  /* On récupère l'index du dernier message juste avant de changer de page pour pouvoir se repositionner
   * dessus lors du changement de page
   * */
  const lastMessages = [...store.messages]
    .sort((a, b) => b.id - a.id)
    .at(index);

  store.previousMessages = [...store.messages].splice(start, count);

  store.messages = [...store.previousMessages, ...message].sort(
    (a, b) => b.id - a.id
  );

  // On attend que la vue se mette à jour
  await nextTick();

  /* Les nouveaux messages sont chargés on peut se positionner sur le précédent pour reprendre
   * la navigation ou elle en était */
  chatStore.newMessagesLoaded(lastMessages);
}
