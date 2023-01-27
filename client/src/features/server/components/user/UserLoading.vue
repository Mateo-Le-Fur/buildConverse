<script setup lang="ts"></script>

<template>
  <div v-for="items of 20" :key="items" class="user d-flex align-items-center">
    <div class="circle"></div>
    <div class="bar"></div>
  </div>
</template>

<style scoped lang="scss">
.user {
  gap: 15px;
  padding-bottom: 15px;

  .circle {
    width: 40px;
    height: 40px;
    background-color: var(--primary-1);
    border-radius: 50%;
  }

  .bar {
    width: 120px;
    height: 15px;
    background-color: var(--primary-1);
    border-radius: 10px;
  }
}
</style>
