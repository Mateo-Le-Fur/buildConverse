import { defineStore } from "pinia";
import { useSocket } from "@/shared/stores/socketStore";
import type { Ref } from "vue";
import { ref } from "vue";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import type { PrivateMessageInterface } from "@/shared/interfaces/PrivateMessageInterface";
import { useMessage } from "@/features/server/stores/messageStore";

interface ChatState {
  element: Ref<HTMLDivElement | null>;
  oldHeight: Ref<number | undefined>;
  page: number;
  limit: number;
  isChangeDirectionToGoDown: boolean | null;
  isChangeDirectionToGoUp: boolean | null;

  direction: string | null;
}

export const useChat = defineStore("chat", {
  state: (): ChatState => ({
    element: ref(null),
    oldHeight: ref(),
    isChangeDirectionToGoDown: null,
    isChangeDirectionToGoUp: null,
    page: 1,
    limit: 50,
    direction: null,
  }),

  getters: {},

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
      socketEventName: string,
      messagesArrayLength: number,
      id: number
    ) {
      const socketStore = useSocket();
      const messageStore = useMessage();

      const target = e.target as HTMLDivElement;

      // On sauvegarde la valeur de l'ancienne direction dans une variable temporaire
      let lastDirection;

      if (target.scrollTop <= 0 && !messageStore.isBeginningConversation) {
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

      this.isChangeDirectionToGoUp =
        lastDirection === "down" && this.direction === "up";
      this.isChangeDirectionToGoDown =
        lastDirection === "up" && this.direction === "down";

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

      socketStore.ioClient?.emit(socketEventName, {
        messagesArrayLength: this.limit * this.page,
        id,
        isBeginningConversation: messageStore.isBeginningConversation,
      });
    },

    newMessagesLoaded() {
      if (this.element?.scrollHeight && this.oldHeight) {
        const messageStore = useMessage();

        const messageId =
          this.direction === "up"
            ? messageStore.messages[messageStore.messages.length / 2 - 1]?.id
            : messageStore.messages[messageStore.messages.length - 1]?.id;

        const messagesElem: NodeListOf<HTMLDivElement> =
          document.querySelectorAll(".message");

        // on place la scroll bar sur le nouveau message chargé
        messagesElem?.forEach((el) => {
          if (Number(el.dataset.id) === messageId) {
            this.element?.scrollTo({
              top: el.offsetTop - el.offsetHeight,
              left: 0,
            });
          }
        });
      }
    },

    filteredMessages<Type extends PrivateMessageInterface | MessageInterface>(
      messages: Type[]
    ): Type[] {
      // On s'assure qu'il n'y a pas de valeurs dupliquées
      const key = "id";
      const values = [
        ...new Map(messages.map((item) => [item[key], item])).values(),
      ];

      // On trie les messages par id, et on vérifie s'il est nécessaire d'afficher l'avatar ou un séparateur de date
      return values
        .sort((a, b) => a.id - b.id)
        .map((message, index) => {
          const previous = values[index - 1];
          const showAvatar = this.shouldShowAvatar(previous, message);
          const separator = this.dateSeparator(previous, message);

          return {
            ...message,
            avatarAuthor: showAvatar ? message.avatarAuthor : null,
            separator,
          };
        });
    },

    shouldShowAvatar<Type extends MessageInterface>(
      previous: Type,
      message: Type
    ): boolean {
      if (!previous) return true;

      const differentUser = message.authorName !== previous.authorName;

      /* On doit aussi vérifier que la date n'a pas changé, si c'est le cas il faut afficher de nouveau
       * l'avatar peu importe l'utilisateur */

      return differentUser || this.dateSeparator(previous, message);
    },

    dateSeparator<Type extends MessageInterface>(
      previous: Type,
      message: Type
    ): boolean {
      const messageStore = useMessage();
      if (previous) {
        const previousDate = new Date(previous.created_at).getDay();
        const date = new Date(message.created_at).getDay();

        return previousDate !== date;
      }

      /* Si le premier message est undefined "const previous = values[index - 1] ==> undefined",
       * et que l'on a atteint le début de la conversation alors il faut
       * afficher un séparateur */
      return !previous && messageStore.isBeginningConversation;
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
