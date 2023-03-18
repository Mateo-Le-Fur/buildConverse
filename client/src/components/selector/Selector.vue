<script setup lang="ts">
import { nextTick } from "vue";

const props = defineProps<{
  active: string | null;
}>();

const emit = defineEmits<{
  (e: "navigate", page: string): void;
}>();
</script>

<template>
  <nav class="selector-container d-flex justify-content-center">
    <ul class="items d-flex align-items-center">
      <li
        @click="emit('navigate', 'Recipient')"
        :class="{ activeComponent: props.active === 'Recipient' }"
        class="privates-item item d-flex align-items-center tooltip"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64h96v80c0 6.1 3.4 11.6 8.8 14.3s11.9 2.1 16.8-1.5L309.3 416H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64z"
          />
        </svg>
        <span class="tooltip-text">Messages</span>
      </li>
      <li
        @click="emit('navigate', 'FriendList')"
        class="friends-item item d-flex align-items-center tooltip"
        :class="{ activeComponent: props.active === 'FriendList' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
          <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"
          />
        </svg>
        <span class="tooltip-text">Amis</span>
      </li>

      <li
        @click="emit('navigate', 'AddFriend')"
        class="add-item item d-flex align-items-center tooltip"
        :class="{ activeComponent: props.active === 'AddFriend' }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
          <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM504 312V248H440c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V136c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H552v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"
          />
        </svg>
        <span class="tooltip-text">Ajouter</span>
      </li>
      <li
        @click="emit('navigate', 'Namespace')"
        :class="{ activeComponent: props.active === 'Namespace' }"
        class="server-item item d-flex align-items-center tooltip"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
          <path
            d="M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 21 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z"
          />
        </svg>

        <span class="tooltip-text">Communautés</span>
      </li>
    </ul>
  </nav>
</template>

<style scoped lang="scss">
.selector-container {
  min-height: 70px;

  .items {
    width: 100%;
    justify-content: space-evenly;
    .item {
      cursor: pointer;
      border: 1px solid hsla(211, 96%, 62%, 1);
      border-radius: 50%;
      padding: 6px;

      svg {
        width: 25px;
        height: 25px;
        fill: var(--primary-2);
      }

      &:hover {
        background: var(--primary-1);

        svg {
          fill: var(--text-color-white);
        }
      }
    }
  }
}

.activeComponent {
  background: var(--primary-1);

  svg {
    fill: var(--primary-4) !important;
  }
}
</style>
