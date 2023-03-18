<script setup lang="ts">
import type { User } from "@/shared/interfaces/User";
import type { RouteParams } from "vue-router";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { useSocket } from "@/shared/stores/socketStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { watch } from "vue";
import { getUserAvatar } from "@/utils/getUserAvatar";

const socketStore = useSocket();
const userNsStore = useNsUser();

const props = defineProps<{
  userList: User[];
  params: RouteParams;
}>();

function loadMoreUser(e: Event) {
  const target = e.target as HTMLDivElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
    socketStore.ioClient?.emit("loadMoreUser", {
      currentArrayLength: props.userList.length,
      namespaceId: props.params.serverId,
    });
  }
}
</script>

<template>
  <div class="user-container d-flex flex-column">
    <h2>Liste des membres</h2>
    <RecycleScroller
      @scroll="loadMoreUser($event)"
      :items="userList"
      :item-size="50"
      :buffer="1000"
      v-slot="{ item }"
      class="scroller"
    >
      <div class="user">
        <img :src="getUserAvatar(item.id)" :alt="item.pseudo" />
        <p :class="{ admin: item.UserHasNamespace?.admin }">
          {{ item.pseudo }}
        </p>
        <div
          :class="{
            online: item.status === 'online',
            offline: item.status === 'offline',
          }"
        ></div>
      </div>
    </RecycleScroller>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";

.user-container {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(calc(-50% + 30px));
  padding: 2.5rem 1.5rem;
  gap: 15px;
  width: 30%;
  min-width: 240px;
  background-color: var(--primary-1);
  border-radius: 5px;

  h2 {
    text-align: center;
  }

  .scroller {
    height: 100%;
  }

  .user {
    max-height: 50px;
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 3px;
    background-color: var(--primary-3);
    border-radius: 10px;

    p {
      color: var(--text-color);
      font-size: 1.2rem;
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .online {
      position: absolute;
      bottom: 3px;
      left: 32px;
      background-color: green;
      height: 17px;
      width: 17px;
      border-radius: 100%;
      border: 3px solid var(--primary-3);
    }

    .offline {
      position: absolute;
      bottom: 3px;
      left: 32px;
      background-color: #6d6d6d;
      height: 17px;
      width: 17px;
      border-radius: 100%;
      border: 3px solid var(--primary-3);
    }
  }
}

.admin {
  color: #e80354 !important;
}
</style>
