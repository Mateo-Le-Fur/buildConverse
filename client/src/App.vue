<script setup lang="ts">
import Namespace from "@/components/Namespace.vue";
import { onMounted, watch } from "vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/home/stores/meStore";

const socketStore = useSocket();
const meStore = useMe();

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
    <Namespace />
    <router-view></router-view>
  </div>
</template>

<style lang="scss">
@import "assets/base.scss";

.app-container {
  height: 100vh;
  background-color: var(--primary-1);
}
</style>
