<script setup lang="ts">
import Namespace from "@/components/Namespace.vue";
import { onMounted, watch } from "vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/home/stores/meStore";
import { useUser } from "@/shared/stores";

const socketStore = useSocket();
const meStore = useMe();
const userStore = useUser();

onMounted(() => {
  window.addEventListener("beforeunload", () => {
    const namespaces = socketStore.namespaces.map((ns) => ns.id);
    const friends = meStore.friends?.map((friend) => friend.id);

    socketStore.ioClient?.emit("leave", { namespaces, friends });
  });
});

watch(
  () => socketStore.isNamespacesLoaded,
  () => {
    if (socketStore.isNamespacesLoaded) {
      const namespaces = socketStore.namespaces.map((ns) => ns.id);
      const friends = meStore.friends?.map((friend) => friend.id);
      socketStore.ioClient?.emit("join", { namespaces, friends });
    }
  }
);
</script>

<template>
  <div class="app-container shape d-flex">
    <Namespace
      v-if="userStore.isAuthenticated && socketStore.isNamespacesLoaded"
    />
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition" mode="out-in">
        <component :is="Component" />
      </transition>
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
  transform: translateY(-100px);
}

.home-enter-active {
  transition: all 0.3s ease-out;
}

.home-leave-to {
  opacity: 0;
}

.home-leave-active {
  transition: all 0.3s ease-in;
}

.server-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}

.server-enter-active {
  transition: all 0.3s ease-out;
}

.server-leave-to {
  opacity: 0;
  transform: translateX(70px);
}

.server-leave-active {
  transition: all 0.3s ease-in;
}
</style>
