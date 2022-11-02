<script setup lang="ts">
import Profil from "@/components/Profil.vue";

import { reactive } from "vue";

const state = reactive<{
  isActive: boolean;
}>({
  isActive: true,
});
</script>

<template>
  <div class="d-flex flex-column">
    <nav class="nav-container d-flex flex-column flex-fill">
      <div
        :class="{ active: state.isActive }"
        class="d-flex align-items-center"
      >
        <svg
          :class="{ active: state.isActive }"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
        >
          <path
            d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"
          />
        </svg>
        <p>Amis</p>
      </div>
    </nav>
    <Profil />
  </div>
</template>

<style scoped lang="scss">
.nav-container {
  color: white;
  width: 240px;
  background-color: var(--primary-2);

  div {
    height: 40px;
    margin: 6px;
    padding-left: 15px;
    cursor: pointer;
    border-radius: 5px;

    svg {
      width: 25px;
      height: 25px;
      fill: white;
    }

    p {
      margin-left: 15px;
    }

    &:hover {
      background-color: var(--primary-1);
    }
  }
}
</style>
