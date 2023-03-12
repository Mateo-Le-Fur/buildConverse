import { defineStore } from "pinia";
import type { Ref } from "vue";
import { ref } from "vue";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import { useMessage } from "@/features/server/stores/messageStore";
import { useMe } from "@/features/me/stores/meStore";
import type { Socket } from "socket.io-client";
import { usePrivateMessage } from "@/features/me/stores/privateMessageStore";

interface ChatState {
  element: Ref<HTMLDivElement | null>;
  oldHeight: Ref<number | undefined>;
  page: number;
  limit: number;
  isChangeDirectionToGoDown: boolean | null;
  isChangeDirectionToGoUp: boolean | null;

  direction: string | null;
}

function shouldShowAvatar<Type extends MessageInterface>(
  previous: Type,
  message: Type
): boolean {
  if (!previous) return true;

  const differentUser = message.authorName !== previous.authorName;

  /* On doit aussi vérifier que la date n'a pas changé, si c'est le cas il faut afficher de nouveau
   * l'avatar peu importe l'utilisateur */
  return differentUser || dateSeparator(previous, message);
}

function dateSeparator<Type extends MessageInterface>(
  previous: Type,
  message: Type
): boolean {
  const messageStore = useMessage();
  const meStore = useMe();
  if (previous) {
    const previousDate = new Date(previous.created_at).getDate();
    const date = new Date(message.created_at).getDate();

    const previousMonth = new Date(previous.created_at).getMonth();
    const month = new Date(message.created_at).getMonth();

    return previousDate !== date && previousMonth !== month;
  }

  /* Si le premier Menu est undefined "const previous = values[index - 1] ==> undefined",
   * et que l'on a atteint le début de la conversation alors il faut
   * afficher un séparateur */
  return (
    messageStore.isBeginningConversation || meStore.isBeginningConversation
  );
}

export const useChat = defineStore("chat", {
  state: (): ChatState => ({
    element: ref(null),
    oldHeight: ref(),
    isChangeDirectionToGoDown: null,
    isChangeDirectionToGoUp: null,
    page: 1,
    limit: 20,
    direction: null,
  }),

  getters: {
    filteredMessages() {
      return <T extends PrivateMessageInterface | MessageInterface>(
        messages: T[]
      ): T[] => {
        // On crée une nouvelle référence pour notre tableau
        const values = [...messages];
        // On trie les messages par id, et on vérifie s'il est nécessaire d'afficher l'avatar ou un séparateur de date
        return values
          .sort((a, b) => a.id - b.id)
          .map((message, index) => {
            const previous = values[index - 1];
            const showAvatar = shouldShowAvatar(previous, message);
            const separator = dateSeparator(previous, message);

            return {
              ...message,
              avatarAuthor: showAvatar ? message.avatarAuthor : null,
              separator,
            };
          });
      };
    },
  },

  actions: {
    init(scrollDiv: HTMLDivElement | null) {
      this.element = scrollDiv;
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
      socket: { socket: Socket; eventName: string },
      messagesArrayLength: number,
      id: number
    ) {
      const messageStore = useMessage();
      const privateMessageStore = usePrivateMessage();

      const target = e.target as HTMLDivElement;

      // On sauvegarde la valeur de l'ancienne direction dans une variable temporaire
      let lastDirection;

      const isBeginningConversation =
        messageStore.isBeginningConversation ||
        privateMessageStore.isBeginningConversation;

      if (target.scrollTop <= 0 && !isBeginningConversation) {
        this.page++;
        lastDirection = this.direction;
        this.direction = "up";
      } else if (
        this.page >= 1 &&
        this.direction &&
        target.scrollHeight - target.scrollTop === target.clientHeight
      ) {
        this.page--;
        lastDirection = this.direction;
        this.direction = "down";
      } else {
        return;
      }

      this.isChangeDirectionToGoDown =
        lastDirection === "up" && this.direction === "down";
      this.isChangeDirectionToGoUp =
        lastDirection === "down" && this.direction === "up";

      /* Si on change de direction pour aller en haut alors il faut de nouveau incrémenter de 1 la page pour
       * ne pas récupérer de nouveau les messages que l'on a déjà dans notre tableau "previousMessages",
       * si on ne fait pas ça on aura les mêmes messages dans nos deux tableaux*/
      if (this.isChangeDirectionToGoUp) {
        this.page++;
      }
      // Et inversement
      else if (this.isChangeDirectionToGoDown) {
        this.page--;
      }

      socket.socket.emit(socket.eventName, {
        messagesArrayLength: this.limit * this.page,
        id,
        isBeginningConversation:
          socket.eventName === "loadMoreMessages"
            ? messageStore.isBeginningConversation
            : privateMessageStore.isBeginningConversation,
      });
    },

    newMessagesLoaded(lastMessage: MessageInterface) {
      if (this.element?.scrollHeight && this.oldHeight) {
        const messagesElem: NodeListOf<HTMLDivElement> =
          document.querySelectorAll(".message");

        /* on place la scroll bar sur le dernier Menu vu afin de ne pas déstabiliser l'utilisateur
         * lorsqu'il va charger plus de Menu */
        messagesElem?.forEach((el) => {
          if (Number(el.dataset.id) === lastMessage.id) {
            this.element?.scrollTo({
              top: el.offsetTop - el.offsetHeight,
              left: 0,
            });
          }
        });
      }
    },

    resetChat() {
      this.direction = null;
      this.isChangeDirectionToGoDown = null;
      this.isChangeDirectionToGoUp = null;
      this.page = 1;
      this.scrollToBottom();
    },
  },
});

// On s'assure qu'il n'y a pas de valeurs dupliquées
// const key = "id";
// const values = [
//   ...new Map(messages.map((item) => [item[key], item])).values(),
// ];
