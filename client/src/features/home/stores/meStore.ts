import { defineStore } from "pinia";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import type { RecipientInterface } from "@/shared/interfaces/RecipientInterface";
import type { Message } from "@/shared/interfaces/Message";

interface meState {
  friends: FriendsInterface[] | null | undefined;
  recipients: RecipientInterface[];
  currentRecipient: RecipientInterface | null;
  isConversationLoaded: boolean;
  messages: Message[];
  error: null | string;
}

export const useMe = defineStore("me", {
  state: (): meState => ({
    friends: [],
    recipients: [],
    currentRecipient: null,
    isConversationLoaded: false,
    messages: [],
    error: null
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

    getPrivateMessageHistory(data: Message[]) {
      this.messages = data;
    },

    privateMessage(data: Message) {
      if (this.currentRecipient?.privateRoomId === data.private_room_id) {
        this.messages.push(data);
      }
    },

    getConversationWithAFriend(data: RecipientInterface) {
      this.currentRecipient = data;

      for (const conversation of this.recipients) {
        if (conversation.privateRoomId === data.privateRoomId) {
          // @ts-ignore
          this.router.push(`/channels/me/${data.privateRoomId}`);
          return;
        }
      }

      this.recipients.push(data);

      // @ts-ignore
      this.router.push(`/channels/me/${data.privateRoomId}`);
    },

    getFriendsRequest() {
      const requestCount = this.friends?.filter(
        (friend) => friend.status === "pending"
      );

      return requestCount?.length;
    },

    friendRequest(data: FriendsInterface) {
      this.friends!.push(data);
    },

    acceptFriendRequest(data: FriendsInterface) {
      const friendIndex = this.friends?.findIndex(
        (friend) => friend.id === data.id
      );

      if (this.friends?.length && friendIndex !== undefined) {
        this.friends[friendIndex].status = data.status;
      }
    },

    declineFriendRequest(senderId: number) {
      this.friends = this.friends?.filter((friend) => friend.id !== senderId);
    },

    friendRequestAccepted(data: FriendsInterface) {
      this.friends?.push(data);
    },

    deleteFriend(friendId: number) {

      this.friends = this.friends?.filter((friend) => friend.id !== friendId)
    },

    updateUser(data: FriendsInterface) {
      const userIndex = this.friends?.findIndex(
        (friend) => friend.id === data.id
      );

      if (this.friends?.length && userIndex !== -1 && userIndex !== undefined) {
        this.friends[userIndex] = data;
      }
    },

    userConnect(data: { id: number }) {
      const friend = this.friends?.find((friend) => friend.id === data.id);

      if (friend) {
        friend.status = "online";
      }
    },

    userDisconnect(data: { id: number }) {
      const friend = this.friends?.find((friend) => friend.id === data.id);

      if (friend) {
        friend.status = "offline";
      }
    },

    getFilteredMessages() {
      return this.messages.map((message, index) => {
        const previous = this.messages[index - 1];
        const showAvatar = this.shouldShowAvatar(previous, message);

        if (showAvatar) {
          return message;
        } else {
          return {
            ...message,
            avatarAuthor: null
          };
        }
      });
    },

    shouldShowAvatar(previous: Message, message: Message) {
      const isFirst = !previous;
      if (isFirst) return true;

      const differentUser = message.authorName !== previous.authorName;
      if (differentUser) return true;
    }
  }
});
