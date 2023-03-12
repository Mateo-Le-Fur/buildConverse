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
      component: () => import("@/views/Menu/Menu.vue"),
      children: [
        {
          path: ":privateRoomId",
          name: "room",
          component: () => import("@/features/me/views/Chat.vue"),
          props: true,
        },
        {
          path: "/channels/:serverId",
          beforeEnter: [isAuthenticatedGaurd],
          component: () => import("@/features/server/Server.vue"),
          props: (route) => ({ serverId: Number(route.params.serverId) }),

          children: [
            {
              path: ":roomId",
              name: "server.room",
              component: () => import("@/features/server/views/Chat.vue"),
              props: (route) => ({ roomId: Number(route.params.roomId) }),
            },
          ],
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
