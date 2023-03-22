<script setup lang="ts">
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { onUnmounted, ref, watch } from "vue";
import UserList from "@/features/server/components/member/MembersList.vue";
import { useRoute } from "vue-router";
import { getUserAvatar } from "@/utils/getUserAvatar";

const roomStore = useRoom();
const userNsStore = useNsUser();
const route = useRoute();
const isUserListPopupOpen = ref<boolean>(false);
</script>

<template>
  <div
    class="top-bar-container d-flex justify-content-center align-items-center flex-fill"
  >
    <div class="name d-flex flex-fill">
      <p class="">{{ roomStore.activeRoom?.name }}</p>
    </div>
    <div
      @click="isUserListPopupOpen = !isUserListPopupOpen"
      class="members-container d-flex align-items-center"
    >
      <div class="member" v-for="user of userNsStore.getFiveMembers()">
        <img loading="lazy" :src="getUserAvatar(user.id)" :alt="user.pseudo" />
      </div>
    </div>
  </div>
  <Teleport to="body">
    <UserList
      v-if="isUserListPopupOpen"
      v-click-outside="() => (isUserListPopupOpen = false)"
    >
      <div @click="isUserListPopupOpen = false" class="calc"></div>
    </UserList>
  </Teleport>
</template>

<style scoped lang="scss">
.top-bar-container {
  position: relative;
  padding: 0 3.2rem;
  width: auto;
  z-index: 0;
  min-height: 70px;
  max-height: 70px;
  background-color: var(--primary-3);
  box-shadow: 0 0 4px 0 #a8a8a8;

  .name {
    p {
      color: var(--primary-2);
      font-weight: 500;
      margin: auto;
      font-size: 1.2rem;
    }
  }

  .members-container {
    position: absolute;
    top: 50%;
    right: 1.8rem;
    transform: translateY(-50%);
    cursor: pointer;
    height: 40px;
    min-width: 80px;
    gap: 2px;
    background-color: var(--primary-2);
    border-radius: 10px;
    padding: 5px;
    .member {
      img {
        width: 17px;
        height: 17px;
        border: 1px solid var(--primary-3);
        border-radius: 50%;
      }
    }

    &:hover {
      background-color: var(--primary-1);
    }
  }
}
</style>
