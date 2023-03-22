<script setup lang="ts">
import Profil from "@/features/me/components/profil/Profil.vue";
import FriendList from "@/components/selector/page/FriendList.vue";
import Recipient from "@/components/selector/page/Recipient.vue";
import AddFriend from "@/components/selector/page/FoundFriend.vue";
import Namespace from "@/components/selector/page/ServerList.vue";
import { type Component, onMounted } from "vue";
import { useRoute } from "vue-router";
import Selector from "@/components/selector/Selector.vue";
import Home from "@/components/Home/Home.vue";
import { usePage } from "@/shared/stores/pageStore";

const route = useRoute();
const pageStore = usePage();

const pages: { [s: string]: Component } = {
  FriendList,
  Recipient,
  AddFriend,
  Namespace,
};
</script>

<template>
  <div class="menu-container d-flex flex-column flex-fill">
    <Profil />
    <div class="separator"></div>
    <nav class="nav-container d-flex flex-column">
      <Selector />
      <div class="separator mb-5"></div>
      <div class="items-container d-flex flex-column g-5 p-5">
        <Component :is="pages[pageStore.page]"></Component>
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
