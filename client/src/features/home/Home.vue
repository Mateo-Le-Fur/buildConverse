<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import PrivateMessage from "@/features/home/components/PrivateMessage.vue";
import FriendList from "@/features/home/views/FriendList.vue";
import { useRoute } from "vue-router";
import { useMe } from "@/features/home/stores/meStore";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Namespace from "@/components/Namespace.vue";

const meStore = useMe();
const route = useRoute();

onBeforeUnmount(() => {
  meStore.currentRecipient = null;
});
</script>

<template>
  <div class="d-flex flex-fill">
    <PrivateMessage />
    <div class="w-100 d-flex">
      <div class="d-flex flex-column flex-fill">
        <FriendList v-if="!route.params.privateRoomId" />
        <router-view v-else></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
