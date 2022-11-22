import { createApp, markRaw } from "vue";
import { createPinia } from "pinia";
// @ts-ignore
import VueVirtualScroller from "vue-virtual-scroller";

import App from "./App.vue";
import { router } from "@/routes";

const app = createApp(App);

const pinia = createPinia();

pinia.use(({ store }) => (store.router = markRaw(router)));

app.use(pinia);
app.use(router);
app.use(VueVirtualScroller);

app.mount("#app");
