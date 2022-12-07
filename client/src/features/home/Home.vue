<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import PrivateMessage from "@/features/home/components/PrivateMessage.vue";

const socketStore = useSocket();
</script>

<template>
  <div v-if="socketStore.isNamespacesLoaded" class="home-container d-flex">
    <PrivateMessage />
    <div class="d-flex flex-column flex-fill">
      <router-view v-slot="{ Component, route }">
        <Component :is="Component" :key="route.fullPath" />
      </router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  width: 100%;
}
</style>
