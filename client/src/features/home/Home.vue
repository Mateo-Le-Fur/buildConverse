<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import PrivateMessage from "@/features/home/components/PrivateMessage.vue";
import FriendList from "@/features/home/views/FriendList.vue";
import { useRoute } from "vue-router";
import { useMe } from "@/features/home/stores/meStore";

const socketStore = useSocket();
const meStore = useMe();

const route = useRoute();

</script>

<template>
  <PrivateMessage />
  <div v-if="socketStore.isNamespacesLoaded" class="home-container d-flex">
    <div class="d-flex flex-column flex-fill">
      <div>
        <FriendList v-if="!route.params.idPrivateMessage" />
      </div>
      <div>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home-container {
  width: 100%;
}
</style>
