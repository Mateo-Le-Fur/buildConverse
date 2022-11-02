<script setup lang="ts">
import Profil from "@/components/Profil.vue";
import { useSocket } from "@/shared/stores/socketStore";
import type { RouteParams } from "vue-router";
import type { Room } from "@/shared/interfaces/Room";

// Je récupère l'id de mon serveur dans le paramètre de ma route
const props = defineProps<{
  params: RouteParams;
}>();

const socketStore = useSocket();

// A chaque changement de serveur je récupère la socket lié a celui-ci
const nsSocket = socketStore.namespaceSockets.find(
  (ns: any) => ns.nsp === `/${props.params.idChannel}`
);

// Je me connecte au serveur
socketStore.joinNamespace(nsSocket, props.params.idChannel as string);
// Je recupère toutes les rooms du serveur

function changeRoom(room: Room) {
  if (socketStore.activeRoom?.id !== room.id) {
    socketStore.ioClient.emit("leaveRoom", socketStore.activeNsSocket.nsp);
    socketStore.joinRoom(room);
  }
}

let rooms: any[] = [];
socketStore.rooms.forEach((room: Room): any => {
  if (room.id.toString() === props.params.idChannel) {
    rooms.push(room);
  }
});
rooms = JSON.parse(JSON.stringify(rooms));
</script>

<template>
  <div class="d-flex flex-column">
    <nav class="nav-container d-flex flex-column flex-fill">
      <div class="server-name d-flex align-items-center">
        <p>{{ rooms[0]?.namespaces.name }}</p>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
          <path
            d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
          />
        </svg>
      </div>
      <template v-for="room of rooms">
        <div
          @click="changeRoom(room)"
          :class="{ active: socketStore.activeRoom.id === room.id }"
          class="rooms d-flex flex-column justify-content-center"
        >
          <p>{{ room.name }}</p>
        </div>
      </template>
    </nav>
    <Profil />
  </div>
</template>

<style scoped lang="scss">
.nav-container {
  color: white;
  width: 240px;
  background-color: var(--primary-2);

  .server-name {
    cursor: pointer;
    padding: 15px;
    font-weight: bold;
    text-align: center;
    justify-content: space-between;

    &:hover {
      background-color: #3d4045;
    }

    svg {
      width: 20px;
      height: 20px;
      fill: white;
    }
  }

  .rooms {
    height: 40px;
    margin: 6px;
    padding: 0 15px;
    cursor: pointer;
    border-radius: 5px;

    &:hover {
      background-color: var(--primary-1);
    }
  }
}
</style>
