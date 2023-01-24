<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import PrivateMessage from "@/features/home/components/PrivateMessage.vue";
import FriendList from "@/features/home/views/FriendList.vue";
import { useRoute } from "vue-router";
import { useMe } from "@/features/home/stores/meStore";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import Namespace from "@/components/Namespace.vue";
import { useNamespace } from "@/features/server/stores/namespaceStore";

const meStore = useMe();
const namespaceStore = useNamespace();
const route = useRoute();

onBeforeUnmount(() => {
  meStore.currentRecipient = null;
});
</script>

<template>
  <div v-if="namespaceStore.isNamespacesLoaded" class="d-flex w-100">
    <PrivateMessage />
    <div class="d-flex w-100 flex-column">
      <FriendList v-if="!route.params.privateRoomId" />
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
