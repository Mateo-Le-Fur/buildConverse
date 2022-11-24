<script setup lang="ts">
import type { User } from "@/shared/interfaces/User";
import type { RouteParams } from "vue-router";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { useSocket } from "@/shared/stores/socketStore";
import UserLoading from "./UserLoading.vue";

const socketStore = useSocket();

const props = defineProps<{
  userList: User[];
  params: RouteParams;
}>();

function onScrollToBottom({
  target: { scrollTop, clientHeight, scrollHeight },
}: any) {
  if (scrollTop + clientHeight + 300 >= scrollHeight) {
    socketStore.activeNsSocket.emit("loadMoreUser", {
      length: props.userList.length,
      namespaceId: props.params.idChannel,
    });
  }
}
</script>

<template>
  <div class="user-container d-flex flex-column">
    <p>Membres: {{ socketStore.numberOfUsers }}</p>
    <DynamicScroller
      @scroll="onScrollToBottom"
      v-if="socketStore.isUsersLoaded"
      :items="userList"
      :min-item-size="1"
      class="scroller"
    >
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :data-index="index">
          <img :src="'data:image/jpeg;base64,' + item.avatar_url" />
          <p :class="{ admin: item.UserHasNamespace?.admin }">
            {{ item.pseudo }}
          </p>
          <div
            :class="{
              online: item.status === 'online',
              offline: item.status === 'offline',
            }"
          ></div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
    <UserLoading v-else />
  </div>
</template>

<style scoped lang="scss">
.scroller {
  height: 100%;
}

.user-container {
  padding: 15px 2px 15px 15px;
  gap: 15px;
  width: 240px;
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

    .online {
      position: absolute;
      bottom: 8px;
      left: 25px;
      background-color: green;
      height: 17px;
      width: 17px;
      border-radius: 100%;
      border: 3px solid var(--primary-2);
    }

    .offline {
      position: absolute;
      bottom: 8px;
      left: 25px;
      background-color: #6d6d6d;
      height: 17px;
      width: 17px;
      border-radius: 100%;
      border: 3px solid var(--primary-2);
    }
  }
}

.admin {
  color: #e80354;
}
</style>
