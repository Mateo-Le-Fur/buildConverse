<script setup lang="ts">
import Namespace from "@/components/Namespace.vue";
import { useUser } from "@/shared/stores";
import { useSocket } from "@/shared/stores/socketStore";
import { watch } from "vue";

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
</script>

<template>
  <div class="app-container d-flex">
    <Namespace v-if="userStore.isAuthenticated" />
    <router-view v-slot="{ Component, route }">
      <Component :is="Component" :key="route.fullPath" />
    </router-view>
  </div>
</template>

<style lang="scss">
@import "assets/base.scss";

.app-container {
  height: 100vh;
}
</style>
