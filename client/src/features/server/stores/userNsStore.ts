import { defineStore } from "pinia";

import type { User } from "@/shared/interfaces/User";
import { useUser } from "@/shared/stores";
import { useMe } from "@/features/home/stores/meStore";
import { useSocket } from "@/shared/stores/socketStore";

interface userState {
  userList: User[];
  numberOfUsers: number;
  isUsersLoaded: boolean;
  error: null | string;
}

export const useNsUser = defineStore("userSocket", {
  state: (): userState => ({
    userList: [],
    numberOfUsers: 0,
    isUsersLoaded: false,
    error: null,
  }),

  actions: {
    getUsersData(data: { users: User[]; numberOfUsers: number }) {
      this.userList = data.users;
      this.numberOfUsers = data.numberOfUsers;

      this.isUsersLoaded = true;
    },

    checkIfTheUserIsAdmin() {
      const userStore = useUser();
      const user = this.userList.find(
        (user) => user.id === userStore.currentUser?.id
      );

      if (user?.UserHasNamespace.admin) {
        return true;
      }
    },

    getUsersNamespace(namespaceId: string) {
      return this.userList.filter(
        (user: User) =>
          user.UserHasNamespace.namespaceId.toString() === namespaceId
      );
    },

    loadMoreUser(data: User[]) {
      this.userList.push(...data);
    },

    addNewUser(data: User[]) {
      this.userList.push(...data);
      this.numberOfUsers++;
    },

    async updateUser(data: User) {
      const socketStore = useSocket();
      if (
        `/${data.UserHasNamespace.namespaceId}` ===
        socketStore.activeNsSocket?.nsp
      ) {
        const userNamespaceIndex = this.userList.findIndex(
          (user) =>
            user.id === data.id &&
            user.UserHasNamespace.namespaceId ===
              data.UserHasNamespace.namespaceId
        );
        if (userNamespaceIndex !== -1) {
          this.userList[userNamespaceIndex] = data;
        }
      }
    },

    deleteUser(data: { id: number; nsId: number }) {
      const socketStore = useSocket();
      if (`/${data.nsId}` === socketStore.activeNsSocket?.nsp) {
        console.log(data);
        const userIndex = this.userList.findIndex(
          (user) => user.id === data.id
        );

        if (userIndex !== -1) {
          this.userList.splice(userIndex, 1);
          this.numberOfUsers--;
        }
      }
    },

    userConnect(data: { id: number }) {
      const user = this.userList.find((user) => user.id === data.id);

      if (user) {
        user!.status = "online";
      }
    },

    userDisconnect(data: { id: number }) {
      const user = this.userList.find((user) => user.id === data.id);

      if (user) {
        user!.status = "offline";
      }
    },
  },
});
