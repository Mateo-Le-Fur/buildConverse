import { defineStore } from "pinia";

import type { User } from "@/shared/interfaces/User";
import { useUser } from "@/shared/stores";

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
    error: null
  }),

  actions: {
    getUsersData(data: { users: User[]; numberOfUsers: number }) {
      console.log("user data : " + data.users);
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
      console.log("update user : " + data);

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

    userConnect(data: { id: number }) {

      let user = this.userList.find(user => user.id === data.id);

      if (user) {
        user!.status = "online";
      }
    },

    userDisconnect(data: { id: number }) {

      console.log(data);
      let user = this.userList.find(user => user.id === data.id);

      if (user) {
        user!.status = "offline";
      }
    }
  }
});
