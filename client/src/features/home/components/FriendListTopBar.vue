<script setup lang="ts">
import { ref } from "vue";
import { useMe } from "@/features/home/stores/meStore";

const meStore = useMe();

defineProps<{
  addFriend: boolean;
}>();

const emit = defineEmits<{
  (e: "selectedItem", status: string): void;
  (e: "addFriend", value: boolean): void;
}>();

const items = ref<{ text: string; status: string }[]>([
  { text: "En ligne", status: "online" },
  { text: "Tous", status: "all" },
  { text: "En attente", status: "pending" },
  { text: "Ajouter un ami", status: "add" },
]);

const selectedItem = ref<{ text: string; status: string }>(items.value[0]);
</script>

<template>
  <div class="top-bar-container d-flex align-items-center mb-20">
    <div class="friend d-flex align-items-center g-10">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
        <path
          d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"
        />
      </svg>
      <p>Amis</p>
    </div>
    <div class="separator"></div>
    <nav class="d-flex">
      <ul class="d-flex g-15">
        <li
          v-for="item of items"
          @click="
            (selectedItem = item),
              emit('selectedItem', item.status),
              emit('addFriend', item.status === 'add')
          "
          :class="{
            selected: item === selectedItem && !addFriend,
            pending: item.status === 'pending',
            add: item.status === 'add',
          }"
          :key="item.text"
        >
          {{ item.text }}
          <div
            v-if="item.status === 'pending'"
            class="d-flex justify-content-center request-count"
          >
            {{ meStore.getFriendsRequest() }}
          </div>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style scoped lang="scss">
.top-bar-container {
  padding: 15px 20px;
  box-shadow: 0 4px 6px -6px #111;
  max-height: 50px;

  .friend {
    svg {
      width: 25px;
      height: 25px;
      fill: #f4f4f4;
    }
  }

  .separator {
    margin: 0 15px 0 10px;
    width: 1px;
    height: 100%;
    background-color: #44484fff;
  }

  nav {
    cursor: pointer;
    ul {
      color: #f4f4f4;

      li {
        border-radius: 5px;
        padding: 2px 8px;
      }

      .selected {
        background-color: #44484fff;
      }

      .pending {
        position: relative;
      }

      .request-count {
        font-size: 0.8rem;
        margin: auto;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: red;
        position: absolute;
        top: -10px;
        right: -10px;
      }
    }

    .add {
      color: #f4f4f4;
      background-color: #2d7c45ff;
    }
  }
}
</style>
