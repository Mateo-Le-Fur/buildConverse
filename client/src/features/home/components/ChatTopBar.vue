<script setup lang="ts">

import { useMe } from "@/features/home/stores/meStore";

const meStore = useMe();
</script>

<template>
  <div class="d-flex align-items-center chat-top-bar">
    <p><span>@</span> {{ meStore.currentRecipient?.pseudo }}</p>
  </div>
</template>

<style scoped lang="scss">

.chat-top-bar {
  height: 50px;
  min-height: 50px;
  background-color: var(--primary-1);
  padding: 10px 15px;
  box-shadow: 0 4px 6px -6px #111;

  p {
    font-size: 1.2rem;

    span {
      font-size: 1.5rem;

    }

  }

}
</style>
