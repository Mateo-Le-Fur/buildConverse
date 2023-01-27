<script setup lang="ts">
import PrivateMessage from "@/features/home/components/PrivateMessage.vue";
import FriendList from "@/features/home/views/FriendList.vue";
import { useRoute } from "vue-router";
import { useMe } from "@/features/home/stores/meStore";
import { onBeforeUnmount } from "vue";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import ProfilMobile from "@/features/home/components/mobile/ProfilMobile.vue";

const meStore = useMe();
const namespaceStore = useNamespace();
const route = useRoute();

onBeforeUnmount(() => {
  meStore.currentRecipient = null;
});
</script>

<template>
  <div
    v-if="namespaceStore.isNamespacesLoaded"
    class="home-container d-flex w-100"
  >
    <PrivateMessage />
    <ProfilMobile />
    <div class="d-flex w-100 flex-column">
      <FriendList v-if="!route.params.privateRoomId" />
      <router-view v-else></router-view>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";
.home-container {
  @include mixins.xs {
    position: relative;
  }
}
</style>
