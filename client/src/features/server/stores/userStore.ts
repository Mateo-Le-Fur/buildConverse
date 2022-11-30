import { defineStore } from "pinia";

import type { User } from "@/shared/interfaces/User";
import { useUser } from "@/shared/stores";

interface userState {
  userList: User[];
  numberOfUsers: number;
  isUsersLoaded: boolean;
}

export const useNsUser = defineStore("userSocket", {
  state: (): userState => ({
    userList: [],
    numberOfUsers: 0,
    isUsersLoaded: false,
  }),

  actions: {
    getUsersData(data: { users: User[]; numberOfUsers: number }) {
      this.userList = data.users;
      this.numberOfUsers = data.numberOfUsers;

      this.isUsersLoaded = true;
    },

    getUsersNamespace(namespaceId: string) {
      return this.userList.filter(
        (user: User) =>
          user.UserHasNamespace.namespace_id.toString() === namespaceId
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
      const userIndex = this.userList.findIndex(
        (user) =>
          user.id === data.id &&
          user.UserHasNamespace.namespace_id ===
            data.UserHasNamespace.namespace_id
      );

      if (userIndex !== -1) {
        this.userList[userIndex] = data;
      }

      const userStore = useUser();
      await userStore.fetchCurrentUser();
    },

    async deleteUser(data: { id: number }) {
      const userIndex = this.userList.findIndex((user) => user.id === data.id);

      if (userIndex !== -1) {
        this.userList.splice(userIndex, 1);
        this.numberOfUsers--;
      }
    },
  },
});
