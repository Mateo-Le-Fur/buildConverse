<script setup lang="ts">
import Room from "@/features/server/components/Room.vue";
import Chat from "@/features/server/components/Chat.vue";
import UserList from "@/features/server/components/UserList.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>

<template>
  <div class="channel-container d-flex">
    <Room :params="route.params" />
    <Chat />
    <UserList :params="route.params" />
  </div>
</template>

<style scoped lang="scss">
.channel-container {
  width: 100%;
}
</style>
