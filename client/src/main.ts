import { createApp, markRaw, watch } from "vue";
import { createPinia } from "pinia";
// @ts-ignore
import VueVirtualScroller from "vue-virtual-scroller";

import App from "./App.vue";
import { router } from "@/routes";
import { useSocket } from "@/shared/stores/socketStore";
import { useUser } from "@/shared/stores";

const app = createApp(App);

const pinia = createPinia();

pinia.use(({ store }) => (store.router = markRaw(router)));

app.use(pinia);
app.use(router);
app.use(VueVirtualScroller);

const socketStore = useSocket();
const userStore = useUser();

watch(
  () => userStore.isAuthenticated,
  () => {
    if (userStore.isAuthenticated) {
      socketStore.init();
      socketStore.initNamespaces();
    }
  }
);

app.mount("#app");
