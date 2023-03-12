<script setup lang="ts">
import Profil from "@/features/me/components/profil/Profil.vue";
import FriendList from "@/components/selector/page/FriendList.vue";
import Recipient from "@/components/selector/page/Recipient.vue";
import AddFriend from "@/components/selector/page/AddFriend.vue";
import Namespace from "@/components/selector/page/ServerList.vue";
import { type Component, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Selector from "@/components/selector/Selector.vue";
import Home from "@/components/Home/Home.vue";
import { useNamespace } from "@/features/server/stores/namespaceStore";

const route = useRoute();
const router = useRouter();
const namespaceStore = useNamespace();

const state = reactive<{
  page: string | null;
  active: string | null;
}>({
  page: localStorage.getItem("item") ?? "FriendList",
  active: localStorage.getItem("item") ?? null,
});

const pages: { [s: string]: Component } = {
  FriendList,
  Recipient,
  AddFriend,
  Namespace,
};

onMounted(() => {
  console.log(route.fullPath);
});

function navigate(page: string | null): void {
  state.page = page;
  state.active = page;

  if (page) localStorage.setItem("item", page);
}
</script>

<template>
  <div class="menu-container d-flex flex-column flex-fill">
    <Profil />
    <div class="separator"></div>
    <nav class="nav-container d-flex flex-column">
      <Selector :active="state.active" @navigate="navigate" />
      <div class="separator mb-5"></div>
      <div class="items-container d-flex flex-column g-5 p-5">
        <Component @navigate="navigate" :is="pages[state.page]"></Component>
      </div>
    </nav>
  </div>
  <router-view v-if="route.fullPath !== '/channels/me'"></router-view>
  <Home v-else />
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";

.menu-container {
  min-width: 300px;
  max-width: 300px;
  background-color: var(--primary-4);
  @include mixins.md {
    display: none;
  }

  .separator {
    margin: 0 auto;
    width: 95%;
    min-height: 1px;
    background-color: var(--primary-2);
  }

  .nav-container {
    height: 100%;

    .items-container {
      height: inherit;
      overflow-y: auto;
    }
  }
}
</style>
