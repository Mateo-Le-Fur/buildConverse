<script setup lang="ts">
import { ref } from "vue";

const items = ref<string[]>(["En ligne", "Tous", "En attente"]);

const selectedItem = ref<string>(items.value[0]);
</script>

<template>
  <div class="top-bar-container d-flex align-items-center">
    <div class="friend d-flex align-items-center g-10">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path
          d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"
        />
      </svg>
      <p>Amis</p>
    </div>
    <div class="sepatator"></div>
    <ul class="d-flex g-25">
      <li
        v-for="(item, index) of items"
        @click="selectedItem = item"
        :class="{ selected: item === selectedItem }"
        :key="index"
      >
        {{ item }}
      </li>
      <li class="add">Ajouter</li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
.top-bar-container {
  padding: 15px 20px;
  border-bottom: 1px solid var(--primary-3);
  max-height: 50px;

  .friend {
    svg {
      width: 25px;
      height: 25px;
      fill: #f4f4f4;
    }
  }

  .sepatator {
    margin: 0 15px 0 10px;
    width: 1px;
    height: 100%;
    background-color: #44484fff;
  }

  ul {
    li {
      padding: 2px 8px;
      cursor: pointer;
      border-radius: 5px;
    }

    .selected {
      background-color: #44484fff;
    }
    .add {
      background-color: #2d7c45ff;
    }
  }
}
</style>
