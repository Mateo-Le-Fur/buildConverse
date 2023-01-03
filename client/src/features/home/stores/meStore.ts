import { defineStore } from "pinia";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";
import type { Message } from "@/shared/interfaces/Message";

interface meState {
  friends: FriendsInterface[] | any[];
  recipients: RecipientInterface[];
  currentRecipient: RecipientInterface | null;
  isConversationLoaded: boolean;
  messages: Message[];
  isMessagePushInArray: boolean;
  isMessagesLoaded: boolean;
  isMoreMessagesLoaded: boolean;
  isBeginningConversation: boolean;
  error: null | string;
}

export const useMe = defineStore("me", {
  state: (): meState => ({
    friends: [],
    recipients: [],
    currentRecipient: null,
    isConversationLoaded: false,
    isMessagesLoaded: false,
    isMoreMessagesLoaded: false,
    messages: [],
    isMessagePushInArray: false,
    isBeginningConversation: false,
    error: null,
  }),

  actions: {
    getFriends(data: FriendsInterface[]) {
      this.friends = data;
    },

    getCurrentConversation(id: number) {
      this.currentRecipient =
        this.recipients.find(
          (conversation) => conversation.privateRoomId === id
        ) ?? null;
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

    getPrivateMessageHistory(data: Message[]) {
      this.isBeginningConversation = data.length < 50;
      this.messages = data;
      this.isMessagesLoaded = true;
    },

    loadMorePrivateMessages(data: Message[]) {
      this.isBeginningConversation =
        data.length < 50 || this.messages.length < 50;

      this.messages.push(...data);

      if (data.length) this.isMoreMessagesLoaded = true;
    },

    privateMessage(data: Message) {
      if (this.currentRecipient?.privateRoomId === data.private_room_id) {
        this.messages.push(data);
        this.isMessagePushInArray = true;
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

      if (this.friends.length && userIndex !== -1 && userIndex !== undefined) {
        this.friends[userIndex] = data;
      }
    },

    userConnect(data: { id: number }) {
      const friend = this.friends.find((friend) => friend.id === data.id);

      if (friend) {
        friend.status = "online";
      }
    },

    userDisconnect(data: { id: number }) {
      const friend = this.friends.find((friend) => friend.id === data.id);

      if (friend) {
        friend.status = "offline";
      }
    },
  },
});
