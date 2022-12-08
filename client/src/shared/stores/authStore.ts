import { defineStore, getActivePinia } from "pinia";
import type { User } from "@/shared/interfaces/User";
import type { LoginForm } from "@/shared/interfaces/LoginForm";
import { fetchCurrentUser, login, logout } from "@/shared/services";
import { useSocket } from "@/shared/stores/socketStore";

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
      const namespaces: number[] = [];
      socketStore.namespaces.forEach((ns) => {
        namespaces.push(ns.id);
      });
      socketStore.ioClient?.emit("leave", { namespaces });
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
