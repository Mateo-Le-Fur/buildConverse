<script setup lang="ts">
import Room from "@/features/server/components/Room.vue";
import Chat from "@/features/server/components/Chat.vue";
import UserList from "@/features/server/components/UserList.vue";
import { useRoute } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { ref, toRefs, watch, watchEffect } from "vue";

const route = useRoute();

const socketStore = useSocket();

const nsSocket = socketStore.namespaceSockets.find(
  (ns: any) => ns.nsp === `/${route.params.idChannel}`
);

// Je me connecte au serveur

socketStore.joinNamespace(nsSocket, route.params.idChannel as string);

function changeRoom(room: RoomInterface) {
  if (socketStore.activeRoom?.id !== room.id) {
    socketStore.activeNsSocket.emit("leaveRoom", socketStore.activeRoom?.id);
    socketStore.joinRoom(room);
  }
}
</script>

<template>
  <div class="channel-container d-flex">
    <Room
      @change-room="changeRoom"
      :rooms="socketStore.getRoom(route.params.idChannel.toString())"
      :active-room-id="socketStore.activeRoom?.id"
      :params="route.params"
    />
    <Chat />
    <UserList :params="route.params" />
  </div>
</template>

<style scoped lang="scss">
.channel-container {
  width: 100%;
}
</style>
