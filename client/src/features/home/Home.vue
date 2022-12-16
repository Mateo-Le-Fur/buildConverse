<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import PrivateMessage from "@/features/home/components/PrivateMessage.vue";
import FriendList from "@/features/home/views/FriendList.vue";
import { useRoute } from "vue-router";
import { useMe } from "@/features/home/stores/meStore";
import { watch } from "vue";

const socketStore = useSocket();
const meStore = useMe();

const route = useRoute();
</script>

<template v-if="meStore.isConversationLoaded">
  <PrivateMessage />
  <div class="home-container d-flex">
    <div class="d-flex flex-column flex-fill">
      <FriendList v-if="!route.params.privateRoomId" />
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  width: 100%;
}
</style>
