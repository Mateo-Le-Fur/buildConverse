<script setup lang="ts">
import Room from "@/features/server/components/Room.vue";
import UserList from "@/features/server/components/UserList.vue";
import { useRoute } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { watch } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import ServerOptions from "@/features/server/components/ServerOptions.vue";

const route = useRoute();

const socketStore = useSocket();
const roomStore = useRoom();
const userNsStore = useNsUser();


//  création ou récupération de namespaces
watch(
  () => socketStore.isNamespacesLoaded,
  (newValue) => {
    if (newValue) {
      joinNamespace();
    }
  }
);

// Permet de naviguer entre les namespaces lorsque la route change
if (`/${route.params.idChannel}` !== socketStore.activeNsSocket?.nsp) {
  if (socketStore.isNamespacesLoaded) {
    joinNamespace();
  }
}

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
  if (roomStore.activeRoom?.id !== room.id) {
    socketStore.activeNsSocket.emit("leaveRoom", roomStore.activeRoom?.id);
    roomStore.joinRoom(room);
  }
}
</script>

<template>
  <div v-if="socketStore.isNamespacesLoaded" class="channel-container d-flex">
    <div class="d-flex flex-column">
      <ServerOptions :route-params="route.params" />
      <Room
        @change-room="changeRoom"
        :rooms="roomStore.getRooms(route.params.idChannel?.toString())"
        :active-room-id="roomStore.activeRoom?.id"
        :params="route.params"
      />
    </div>

    <router-view :params="route.params"></router-view>
    <UserList
      :user-list="
        userNsStore.getUsersNamespace(route.params.idChannel?.toString())
      "
      :params="route.params"
    />
  </div>
</template>

<style scoped lang="scss">
.channel-container {
  width: 100%;
}

.server-leave-to,
.server-enter-from {
  opacity: 0;
}

.server-leave-from,
.server-enter-to {
  opacity: 1;
}

.server-leave-active,
.server-enter-active {
  transition: all 0.3s;
}
</style>
