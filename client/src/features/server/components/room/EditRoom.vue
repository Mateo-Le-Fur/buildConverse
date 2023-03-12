<script setup lang="ts">
import type { RoomInterface } from "@/shared/interfaces/Room";
import { ref } from "vue";
const inputElem = ref<HTMLInputElement | null>(null);

const props = defineProps<{
  room: RoomInterface;
}>();

const emit = defineEmits<{
  (e: "update", room: RoomInterface, input: HTMLInputElement | string): void;
}>();
</script>

<template>
  <div class="edit-room d-flex align-items-center">
    <div class="input-container d-flex align-items-center">
      <input
        v-focus
        ref="inputElem"
        class="input-edit-room"
        type="text"
        :value="room.name"
      />

      <svg
        @click.stop.prevent="emit('update', props.room, inputElem)"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path
          d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.edit-room {
  height: 40px;
  width: 220px;

  .input-container {
    height: inherit;
    width: inherit;
    border-radius: 6px;

    background-color: var(--primary-2);

    input {
      padding: 1px 0 0 15px;
      height: inherit;
      max-width: 190px;
      font-size: 1rem;
      outline: none;
      border: none;
      color: var(--text-color-white);
      background-color: var(--primary-2);
    }

    svg {
      display: block !important;
      fill: green;
      width: 20px;
      height: 20px;
    }
  }
}
</style>
