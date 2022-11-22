import { createRouter, createWebHistory } from "vue-router";
import { useUser } from "@/shared/stores";
import {
  isAuthenticatedGaurd,
  isNotAuthenticatedGaurd,
  initNamespace,
} from "@/shared/guards";
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
      component: () => import("@/views/Signin.vue"),
    },

    {
      path: "/home",
      beforeEnter: [isAuthenticatedGaurd, initNamespace],
      component: () => import("@/features/home/Home.vue"),
    },

    {
      path: "/channels/:idChannel",
      beforeEnter: [isAuthenticatedGaurd, initNamespace],
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
