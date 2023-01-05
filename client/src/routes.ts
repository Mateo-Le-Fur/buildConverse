import { createRouter, createWebHistory } from "vue-router";
import { useUser } from "@/shared/stores";
import { isAuthenticatedGaurd, isNotAuthenticatedGaurd } from "@/shared/guards";
// import NotFound from "@/views/NotFound.vue";
// import { ADMIN_ROUTES } from "@/features/admin/admin.routes";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/inscription",
    },

    {
      path: "/connexion",
      beforeEnter: [isNotAuthenticatedGaurd],
      component: () => import("@/views/Login.vue"),
    },

    {
      path: "/inscription",
      beforeEnter: [isNotAuthenticatedGaurd],
      component: () => import("@/views/Register.vue"),
    },

    {
      path: "/channels/me",
      beforeEnter: [isAuthenticatedGaurd],
      meta: { transition: "home" },
      component: () => import("@/features/home/Home.vue"),
      children: [
        {
          path: "me",
          name: "me",
          component: () => import("@/features/home/views/FriendList.vue"),
          props: true,
        },
        {
          path: ":privateRoomId",
          name: "privateRoom",
          component: () => import("@/features/home/views/Chat.vue"),
          props: true,
        },
      ],
    },

    {
      path: "/channels/:idChannel",
      meta: { transition: "server" },
      beforeEnter: [isAuthenticatedGaurd],
      component: () => import("@/features/server/Server.vue"),
      children: [
        {
          path: ":idRoom",
          name: "room",
          component: () => import("@/features/server/views/Chat.vue"),
          props: true,
        },
      ],
    },
  ],
});

router.beforeEach(async () => {
  const userStore = useUser();
  if (!userStore.loaded) {
    await userStore.fetchCurrentUser();
  }
});
