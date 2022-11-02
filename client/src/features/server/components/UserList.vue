<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import type { User } from "@/shared/interfaces/User";
import type { RouteParams } from "vue-router";

const props = defineProps<{
  params: RouteParams;
}>();

const socketStore = useSocket();

const userList: User[] = [];

console.time("start");
socketStore.userList.forEach((element: any) => {
  element.forEach((user: User) => {
    if (
      user.user_has_namespace.namespace_id.toString() === props.params.idChannel
    ) {
      userList.push(user);
    }
  });
});

console.timeEnd("start");
</script>

<template>
  <div class="user-container d-flex flex-column">
    <p>Membres: {{ userList.length }}</p>
    <template v-for="user of userList">
      <div class="user d-flex align-items-center">
        <img
          src="https://plus.unsplash.com/premium_photo-1663054403667-63a04e2e49a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1499&q=80"
        />
        <p>{{ user.pseudo }}</p>
        <div class="status"></div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.user-container {
  padding: 15px;
  gap: 15px;
  color: white;
  min-width: 240px;
  background-color: var(--primary-2);

  .user {
    gap: 15px;
  }

  div {
    position: relative;
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .status {
      position: absolute;
      bottom: 0;
      left: 25px;
      background-color: green;
      height: 17px;
      width: 17px;
      border-radius: 100%;
      border: 3px solid var(--primary-2);
    }
  }
}
</style>
