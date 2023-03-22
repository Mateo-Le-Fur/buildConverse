import { defineStore } from "pinia";

interface PageState {
  page: string | null;
  active: string | null;
}

export const usePage = defineStore("pageStore", {
  state: (): PageState => ({
    page: localStorage.getItem("item") ?? "FriendList",
    active: localStorage.getItem("item") ?? "FriendList",
  }),

  getters: {},

  actions: {
    navigate(page: string | null): void {
      this.page = page;
      this.active = page;

      if (page) localStorage.setItem("item", page);
    },
  },
});
