<script setup lang="ts">
import Namespace from "@/components/namespace/Namespace.vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/home/stores/meStore";
import { useUser } from "@/shared/stores";
import { useRouter } from "vue-router";
import { useNamespace } from "@/features/server/stores/namespaceStore";

const socketStore = useSocket();
const namespaceStore = useNamespace();
const meStore = useMe();
const userStore = useUser();
const router = useRouter();
</script>

<template>
  <div class="app-container shape d-flex">
    <Namespace
      v-if="userStore.isAuthenticated && namespaceStore.isNamespacesLoaded"
    />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<style lang="scss">
@import "assets/base.scss";

.app-container {
  height: 100vh;
  background-color: var(--primary-1);
}

.home-enter-from {
  opacity: 0;
}

.home-enter-active {
  transition: all 0.2s ease-out;
}

.home-leave-to {
  opacity: 0;
}

.home-leave-active {
  transition: all 0.2s ease-in;
}

.server-enter-from {
  opacity: 0;
}

.server-enter-active {
  transition: all 0.2s ease-out;
}

.server-leave-to {
  opacity: 0;
}

.server-leave-active {
  transition: all 0.2s ease-in;
}
</style>
