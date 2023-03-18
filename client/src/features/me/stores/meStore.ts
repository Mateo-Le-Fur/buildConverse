import { defineStore } from "pinia";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";
import { useSocket } from "@/shared/stores/socketStore";
import type { MeState } from "@/shared/interfaces/meState";
import { useNamespace } from "@/features/server/stores/namespaceStore";

export const useMe = defineStore("me", {
  state: (): MeState => ({
    friends: [],
    recipients: [],
    currentRecipient: null,
    currentRoomId: null,
    error: null,
  }),

  getters: {
    getCurrentRecipient(
      state
    ): (privateRoomId: number) => RecipientInterface | undefined {
      return (privateRoomId: number) =>
        state.recipients.find(
          (recipient) => recipient.privateRoomId === privateRoomId
        );
    },

    getNextFriend(state): (id: number) => FriendsInterface | undefined {
      return (id: number) => state.friends.find((friend) => friend.id !== id);
    },
  },

  actions: {
    getFriends(data: FriendsInterface[]) {
      this.friends = data;
    },

    getCurrentConversation(id: number) {
      const socketStore = useSocket();
      const namespaceStore = useNamespace();
      this.currentRecipient =
        this.recipients.find(
          (conversation) => conversation.privateRoomId === id
        ) ?? null;

      if (this.currentRecipient) {
        this.currentRoomId = this.currentRecipient?.privateRoomId;
        namespaceStore.activeNamespaceId = null;
      }

      socketStore.ioClient?.emit("getPrivateMessagesHistory", id);
    },

    getAllConversations(data: RecipientInterface[]) {
      if (data[0]) {
        this.recipients = data;
      }
    },

    disableConversation(privateRoomId: string) {
      const index = this.recipients.findIndex(
        (recipient) => recipient.privateRoomId === Number(privateRoomId)
      );

      if (index !== -1) {
        this.recipients[index].active = false;
      }
    },

    getConversationWithAFriend(data: RecipientInterface) {
      this.currentRecipient = data;

      const index = this.recipients.findIndex(
        (recipient) => recipient.privateRoomId === data.privateRoomId
      );

      if (index !== -1) {
        this.recipients[index].active = true;
      }

      for (const conversation of this.recipients) {
        if (conversation.privateRoomId === data.privateRoomId) {
          // @ts-ignore
          this.router.push(`/channels/me/${data.privateRoomId}`);
          return;
        }
      }

      // @ts-ignore
      this.router.push(`/channels/me/${data.privateRoomId}`);
    },

    getFriendsRequest() {
      const requestCount = this.friends.filter(
        (friend) => friend.status === "pending"
      );

      return requestCount?.length;
    },

    friendRequest(data: FriendsInterface) {
      this.friends.push(data);
    },

    acceptFriendRequest(data: FriendsInterface) {
      const friendIndex = this.friends.findIndex(
        (friend) => friend.id === data.id
      );

      if (this.friends.length && friendIndex !== undefined) {
        this.friends[friendIndex].status = data.status;

        const recipient = {
          ...this.friends[friendIndex],
          ...data,
        };

        this.recipients.push(recipient);
      }
    },

    declineFriendRequest(senderId: number) {
      this.friends = this.friends.filter((friend) => friend.id !== senderId);
    },

    friendRequestAccepted(data: FriendsInterface) {
      this.friends.push(data);
      this.recipients.push(data);
    },

    deleteFriend(data: { id: number; privateRoomId: number }) {
      this.friends = this.friends.filter((friend) => friend.id !== data.id);

      if (data.privateRoomId) {
        this.recipients = this.recipients.filter(
          (recipient) => recipient.privateRoomId !== data.privateRoomId
        );
      }

      if (this.currentRecipient?.privateRoomId === data.privateRoomId) {
        this.currentRecipient = null;
        // @ts-ignore
        this.router.push("/channels/me");
      }
    },

    updateUser(data: FriendsInterface) {
      const userIndex = this.friends.findIndex(
        (friend) => friend.id === data.id
      );

      if (this.friends.length && userIndex !== -1) {
        this.friends[userIndex] = data;
      }

      this.recipients?.forEach((recipient) => {
        if (recipient.id === data.id) {
          recipient.pseudo = data.pseudo;
          recipient.description = data.description;
        }

        if (recipient.id === this.currentRecipient?.id)
          this.currentRecipient = { ...recipient };
      });
    },

    userConnect(data: { id: number }) {
      const friend = this.friends.find((friend) => friend.id === data.id);
      const recipient = this.recipients.find((friend) => friend.id === data.id);

      if (friend) {
        friend.status = "online";
      }
      if (recipient) {
        recipient.status = "online";
      }
    },

    userDisconnect(data: { id: number }) {
      const friend = this.friends.find((friend) => friend.id === data.id);
      const recipient = this.recipients.find((friend) => friend.id === data.id);

      if (friend) {
        friend.status = "offline";
      }
      if (recipient) {
        recipient.status = "offline";
      }
    },
  },
});
