import { defineStore } from "pinia";
import type { User } from "@/shared/interfaces/User";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";

interface meState {
  friends: FriendsInterface[] | null | undefined;
  conversations: [];
  messages: [];
  error: null | string;
}

export const useMe = defineStore("me", {
  state: (): meState => ({
    friends: [],
    conversations: [],
    messages: [],
    error: null,
  }),

  actions: {
    getFriends(data: FriendsInterface[]) {
      this.friends = data;
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

    updateUser(data: FriendsInterface) {
      const userIndex = this.friends?.findIndex(
        (friend) => friend.id === data.id
      );

      if (this.friends?.length && userIndex !== -1 && userIndex !== undefined) {
        this.friends[userIndex] = data;
      }
    },

    deleteUser() {},

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
  },
});
