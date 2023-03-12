<script setup lang="ts">
import Room from "@/features/server/components/room/Room.vue";
import { useRoute } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { nextTick, onUnmounted, watch } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import ServerOptions from "@/features/server/components/community/ServerOptions.vue";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import { useMessage } from "@/features/server/stores/messageStore";

const route = useRoute();

const socketStore = useSocket();
const namespaceStore = useNamespace();
const roomStore = useRoom();
const userNsStore = useNsUser();
const messageStore = useMessage();

const props = defineProps<{
  serverId: Number;
}>();

watch(
  () => props.serverId,
  async (value) => {
    if (value) await joinNamespace();
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
    route.params.roomId as string,
    route.params.serverId as string
  );
}

function changeRoom(room: RoomInterface) {
  if (roomStore.activeRoom?.id !== Number(room.id)) {
    socketStore.ioClient?.emit("leaveRoom", roomStore.activeRoom?.id);
    roomStore.joinRoom(room, room.namespaceId);
  }
}

onUnmounted(() => {
  namespaceStore.activeNamespace = null;
  namespaceStore.activeNamespaceId = null;
});
</script>

<template>
  <div class="channel-container d-flex flex-fill">
    <div class="right-container d-flex flex-column flex-fill">
      <div
        class="d-flex flex-fill overflow-auto overflow-x-hidden"
        style="min-width: 0"
      >
        <router-view :key="route.params"></router-view>
        <nav class="server-rooms-container d-flex flex-column">
          <ServerOptions :server-id="props.serverId" />
          <Room
            @change-room="changeRoom"
            :active-room-id="roomStore.activeRoom?.id"
            :server-id="props.serverId"
          />
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.server-rooms-container {
  background-color: var(--primary-4) !important;
}
</style>
