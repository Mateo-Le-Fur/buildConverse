import { defineStore } from "pinia";

import type { User } from "@/shared/interfaces/User";
import { useUser } from "@/shared/stores";
import { useMe } from "@/features/me/stores/meStore";
import { useSocket } from "@/shared/stores/socketStore";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import type { UserHasNamespace } from "@/shared/interfaces/UserHasNamespace";

interface userState {
  userList: User[];
  numberOfUsers: number;
  usersOnline: number;
  isUsersLoaded: boolean;
  error: null | string;
}

export const useNsUser = defineStore("userSocket", {
  state: (): userState => ({
    userList: [],
    numberOfUsers: 0,
    usersOnline: 0,
    isUsersLoaded: false,
    error: null,
  }),

  getters: {
    getFiveMembers(state): () => (User | undefined)[] {
      return () =>
        state.userList.map((user: User, index) => {
          if (index < 5 - 1) {
            return user;
          }
        });
    },
  },

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
      return this.userList
        .sort((a, b) => b.status!.localeCompare(a.status))
        .filter(
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
      const userNamespaceIndex = this.userList.findIndex(
        (user) =>
          user.id === data.id &&
          user.UserHasNamespace.namespaceId ===
            data.UserHasNamespace.namespaceId
      );
      if (userNamespaceIndex !== -1) {
        this.userList[userNamespaceIndex] = data;
      }
    },

    deleteUser(data: { id: number; nsId: number }) {
      const namespaceStore = useNamespace();
      if (data.nsId === namespaceStore.activeNamespace?.id) {
        const userIndex = this.userList.findIndex(
          (user) => user.id === data.id
        );

        if (userIndex !== -1) {
          this.userList.splice(userIndex, 1);
          this.numberOfUsers--;
        }
      }
    },

    userConnect(data: User[]) {
      const namespaceStore = useNamespace();

      const [userData] = [...data];

      const index = this.userList.findIndex((user) => user.id === userData.id);

      if (index !== -1) {
        this.userList[index].status = "online";
      }

      namespaceStore.namespaces.forEach((namespace) => {
        if (userData.UserHasNamespace.namespaceId === namespace.id) {
          namespace.usersOnline++;
        }
      });
    },

    userDisconnect(data: UserHasNamespace) {
      const namespaceStore = useNamespace();

      const index = this.userList.findIndex((user) => user.id === data.userId);

      if (index !== -1) {
        this.userList[index].status = "offline";
      }

      namespaceStore.namespaces.forEach((namespace) => {
        if (data.namespaceId === namespace.id) {
          namespace.usersOnline--;
        }
      });
    },
  },
});
