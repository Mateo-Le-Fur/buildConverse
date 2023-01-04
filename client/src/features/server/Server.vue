<script setup lang="ts">
import Room from "@/features/server/components/Room.vue";
import UserList from "@/features/server/components/UserList.vue";
import { useRoute } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { onMounted, onUnmounted, watch } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import ServerOptions from "@/features/server/components/ServerOptions.vue";
import SearchBar from "@/features/server/components/SearchBar.vue";
import Namespace from "@/components/Namespace.vue";

const route = useRoute();

const socketStore = useSocket();
const roomStore = useRoom();
const userNsStore = useNsUser();

//  création ou récupération de namespaces
// watch(
//   () => socketStore.isNamespacesLoaded,
//   (newValue) => {
//     if (newValue && socketStore.namespaces.length) {
//       joinNamespace();
//     }
//   }
// );

watch(
  () => [
    route.params.idChannel,
    socketStore.isNamespacesLoaded,
    socketStore.creatingNamespace,
  ],
  () => {
    console.log(route.params);
    if (socketStore.isNamespacesLoaded && route.params.idChannel) {
      joinNamespace();
    }
  },
  {
    immediate: true,
  }
);

function joinNamespace() {
  const nsSocket = socketStore.namespaceSockets.find(
    (ns: any) => ns.nsp === `/${route.params.idChannel}`
  );

  socketStore.joinNamespace(
    nsSocket,
    route.params.idRoom as string,
    route.params.idChannel as string
  );
}

function changeRoom(room: RoomInterface) {
  if (roomStore.activeRoom?.id !== Number(room.id)) {
    socketStore.isMessagesLoaded = false;
    socketStore.activeNsSocket.emit("leaveRoom", roomStore.activeRoom?.id);
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
        :rooms="roomStore.getRooms(route.params.idChannel?.toString())"
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
        <router-view :params="route.params"></router-view>
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
