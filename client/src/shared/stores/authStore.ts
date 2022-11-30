import { defineStore } from "pinia";
import type { User } from "@/shared/interfaces/User";
import type { LoginForm } from "@/shared/interfaces/LoginForm";
import { fetchCurrentUser, login, logout } from "@/shared/services";

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
      await logout();
      this.currentUser = null;
    },

    async fetchCurrentUser() {
      this.currentUser = await fetchCurrentUser();

      this.loaded = true;
    },
  },
});
