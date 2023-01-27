<script setup lang="ts">
import Namespace from "@/components/namespace/Namespace.vue";
import { onMounted, ref, watch } from "vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/home/stores/meStore";
import { useUser } from "@/shared/stores";
import { useRoute, useRouter } from "vue-router";
import { object } from "zod";
import { useNamespace } from "@/features/server/stores/namespaceStore";

const route = useRoute();

const socketStore = useSocket();
const namespaceStore = useNamespace();
const meStore = useMe();
const userStore = useUser();
const router = useRouter();

const shouldShowAnimation = ref<boolean>(true);

watch(router.currentRoute, (value, oldValue) => {
  const isNewValueDifferentFromOld =
    value.fullPath === "/channels/me" &&
    oldValue.fullPath.includes("/channels/me/");

  const firstCheck = (shouldShowAnimation.value = !(
    isNewValueDifferentFromOld || value.params.privateRoomId
  ));

  const regex = /\/channels\/\d+/;

  if (value.fullPath.match(regex)) {
    const isSameChannel = value.params.idChannel === oldValue.params.idChannel;

    shouldShowAnimation.value = !isSameChannel;
  } else {
    shouldShowAnimation.value = firstCheck;
  }
});
</script>

<template>
  <div class="app-container shape d-flex">
    <Namespace v-if="userStore.isAuthenticated" />
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<style lang="scss">
@import "assets/base.scss";

.app-container {
  height: 100vh;
  background-color: var(--primary-1);
}

.home-enter-from {
  opacity: 0;
}

.home-enter-active {
  transition: all 0.2s ease-out;
}

.home-leave-to {
  opacity: 0;
}

.home-leave-active {
  transition: all 0.2s ease-in;
}

.server-enter-from {
  opacity: 0;
}

.server-enter-active {
  transition: all 0.2s ease-out;
}

.server-leave-to {
  opacity: 0;
}

.server-leave-active {
  transition: all 0.2s ease-in;
}
</style>
