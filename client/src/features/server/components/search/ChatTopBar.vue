<script setup lang="ts">
import { useRoom } from "@/features/server/stores/roomStore";

const roomStore = useRoom();
</script>

<template>
  <div class="container d-flex align-items-center flex-fill p-15">
    <p class="name d-flex">{{ roomStore.activeRoom?.name }}</p>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: auto;
  z-index: 0;
  min-height: 70px;
  max-height: 70px;
  background-color: var(--primary-3);
  box-shadow: 0 0 4px 0 #a8a8a8;

  .name {
    color: var(--primary-2);
    font-weight: 500;
    margin: auto;
    font-size: 1.2rem;
  }
}
</style>
