<script setup lang="ts">
import Room from "@/features/server/components/room/Room.vue";
import UserList from "@/features/server/components/user/UserList.vue";
import { useRoute } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { nextTick, watch } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import ServerOptions from "@/features/server/components/namespace/ServerOptions.vue";
import SearchBar from "@/features/server/components/search/SearchBar.vue";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import { useMessage } from "@/features/server/stores/messageStore";

const route = useRoute();

const socketStore = useSocket();
const namespaceStore = useNamespace();
const roomStore = useRoom();
const userNsStore = useNsUser();
const messageStore = useMessage();
watch(
  () => route.params.idChannel,
  async (value) => {
    if (value) await joinNamespace();
  }
);

watch(
  () => route.params.idRoom,
  () => {
    messageStore.isBeginningConversation = false;
  }
);

watch(
  () => namespaceStore.isNamespacesLoaded,
  async (value) => {
    if (value) {
      await joinNamespace();
    }
  },
  {
    immediate: true,
  }
);

async function joinNamespace() {
  await nextTick();

  namespaceStore.joinNamespace(
    route.params.idRoom as string,
    route.params.idChannel as string
  );
}

function changeRoom(room: RoomInterface) {
  if (roomStore.activeRoom?.id !== Number(room.id)) {
    socketStore.ioClient?.emit("leaveRoom", roomStore.activeRoom?.id);
    roomStore.joinRoom(room, room.namespaceId);
  }
}
</script>

<template>
  <div class="channel-container d-flex">
    <div class="d-flex flex-column">
      <ServerOptions :route-params="route.params" />
      <Room
        @change-room="changeRoom"
        :active-room-id="roomStore.activeRoom?.id"
        :params="route.params"
      />
    </div>
    <div class="right-container d-flex flex-column flex-fill">
      <SearchBar />
      <div
        class="d-flex flex-fill overflow-auto overflow-x-hidden"
        style="min-width: 0"
      >
        <router-view :key="route.params"></router-view>
        <UserList
          :user-list="
            userNsStore.getUsersNamespace(route.params.idChannel?.toString())
          "
          :params="route.params"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.channel-container {
  width: 100%;

  .right-container {
    min-width: 0;
  }
}
</style>
