import { defineStore, getActivePinia } from "pinia";
import type { User } from "@/shared/interfaces/User";
import type { LoginForm } from "@/shared/interfaces/LoginForm";
import { fetchCurrentUser, login, logout } from "@/shared/services";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/home/stores/meStore";

interface AuthState {
  currentUser: User | null;
  loaded: boolean;
}

export const useUser = defineStore("user", {
  state: (): AuthState => ({
    currentUser: null,
    loaded: false,
  }),

  getters: {
    isAuthenticated(state): boolean | null {
      if (state.currentUser) {
        if (state.currentUser.statusCode) {
          return state.currentUser.statusCode < 400;
        }
        return true;
      } else if (!state.currentUser && state.loaded) {
        return false;
      } else {
        return null;
      }
    },
  },

  actions: {
    async login(loginForm: LoginForm) {
      try {
        this.currentUser = await login(loginForm);
      } catch (e) {
        throw e;
      }
    },

    async logout() {
      const socketStore = useSocket();
      const meStore = useMe();
      const namespaces = socketStore.namespaces.map((ns) => ns.id);
      const friends = meStore.friends?.map((friend) => friend.id);
      socketStore.ioClient?.emit("leave", { namespaces, friends });
      await logout();
      socketStore.ioClient?.disconnect();
      socketStore.namespaceSockets.forEach((nsSocket: any) => {
        nsSocket.disconnect();
      });

      // @ts-ignore
      getActivePinia()._s.forEach((store) => store.$reset());
      // @ts-ignore
      await this.router.push("/connexion");
    },

    async fetchCurrentUser() {
      this.currentUser = await fetchCurrentUser();

      this.loaded = true;
    },
  },
});
