<script setup lang="ts">
import Room from "@/features/server/components/Room.vue";
import UserList from "@/features/server/components/UserList.vue";
import { useRoute } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { watch } from "vue";

const route = useRoute();

const socketStore = useSocket();

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
  if (socketStore.activeRoom?.id !== room.id) {
    socketStore.activeNsSocket.emit("leaveRoom", socketStore.activeRoom?.id);
    socketStore.joinRoom(room);
  }
}
</script>

<template>
  <!--  <div-->
  <!--    class="channel-container d-flex align-items-center justify-content-center"-->
  <!--    v-if="!socketStore.isNamespacesLoaded"-->
  <!--  >-->
  <!--    <Spinner />-->
  <!--  </div>-->
  <div v-if="socketStore.isNamespacesLoaded" class="channel-container d-flex">
    <Room
      @change-room="changeRoom"
      :rooms="socketStore.getRoom(route.params.idChannel?.toString())"
      :active-room-id="socketStore.activeRoom?.id"
      :params="route.params"
    />
    <router-view></router-view>
    <UserList
      :user-list="socketStore.getUser(route.params.idChannel?.toString())"
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
