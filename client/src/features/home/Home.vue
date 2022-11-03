<script setup lang="ts">
import FriendsList from "@/features/home/components/FriendsList.vue";
import { useSocket } from "@/shared/stores/socketStore";

// const socketStore = useSocket();
</script>

<template>
  <div class="home-container d-flex">
    <FriendsList />
    <!--    <router-view v-slot="{ Component, route }">-->
    <!--      <Component :is="Component" :key="route.fullPath" />-->
    <!--    </router-view>-->
  </div>
</template>

<style scoped lang="scss">
.home-container {
  width: 100%;
}
</style>
