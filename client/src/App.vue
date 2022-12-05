<script setup lang="ts">
import Namespace from "@/components/Namespace.vue";
import { useUser } from "@/shared/stores";
import { onMounted, watch } from "vue";
import { useSocket } from "@/shared/stores/socketStore";

const userStore = useUser();
const socketStore = useSocket();

onMounted(() => {
  window.addEventListener("beforeunload", () => {
    const namespaces: number[] = [];
    socketStore.namespaces.forEach((ns) => {
      namespaces.push(ns.id);
    });
    socketStore.ioClient?.emit("leave", { namespaces });
  });

});

watch(() => socketStore.isNamespacesLoaded, () => {
  if (socketStore.isNamespacesLoaded) {
    const namespaces: number[] = [];
    socketStore.namespaces.forEach((ns) => {
      namespaces.push(ns.id);
    });
    socketStore.ioClient?.emit("join", { namespaces });
  }

});


</script>

<template>
  <div class="app-container d-flex">
    <Namespace />
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
