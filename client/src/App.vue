<script setup lang="ts"></script>

<template>
  <div class="app-container shape d-flex">
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<style lang="scss">
@import "assets/base.scss";

.app-container {
  height: 100vh;
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
