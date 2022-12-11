<script setup lang="ts">
import Profil from "@/components/Profil.vue";
import SearchBar from "@/features/home/components/SearchBar.vue";
import { onMounted, reactive } from "vue";

const state = reactive<{
  elementActive: string;
}>({
  elementActive: "friends",
});

console.log(state.elementActive)
</script>

<template>
  <div class="d-flex flex-column flex-fill">
    <SearchBar />
    <nav class="nav-container d-flex flex-column flex-fill p-8">
      <router-link  to="/channels/me">
        <div
          @click="state.elementActive = 'friends'"
          :class="{
            active: state.elementActive === 'friends',
          }"
          class="d-flex align-items-center g-10 friend p-10 mb-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
            <path
              d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"
            />
          </svg>
          <p>Amis</p>
        </div>
      </router-link>

      <div class="private-message-container d-flex flex-column g-5">
        <p class="p-10">Messages Privés</p>
        <div
          @click="state.elementActive = ''"
          :class="{
            active: state.elementActive === '',
          }"
          class="private-message d-flex flex-column"
        >
          <router-link  class="p-10" to="/channels/me/123">TEST</router-link>
        </div>
      </div>
    </nav>
    <Profil />
  </div>
</template>

<style scoped lang="scss">
.nav-container {
  width: 240px;
  background-color: var(--primary-2);

  a {
    color: #f4f4f4;
    text-decoration: none;
  }

  .friend {
    height: 40px;
    border-radius: 5px;

    svg {
      width: 25px;
      height: 25px;
      fill: white;
    }
  }

  .private-message-container {
    .private-message {
      border-radius: 5px;
    }
  }
}
</style>
