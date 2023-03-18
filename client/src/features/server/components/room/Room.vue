<script setup lang="ts">
import type { RouteParams } from "vue-router";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { nextTick, ref, watch } from "vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { useRoom } from "@/features/server/stores/roomStore";
import botAvatar from "@/assets/images/bot.png";
import { useMessage } from "@/features/server/stores/messageStore";
import EditRoom from "@/features/server/components/room/EditRoom.vue";
import CreateRoom from "@/features/server/components/room/CreateRoom.vue";

const socketStore = useSocket();
const userNsStore = useNsUser();
const roomStore = useRoom();
const messageStore = useMessage();

// Je récupère l'id de mon serveur dans le paramètre de ma route
const props = defineProps<{
  roomId: Number;
  serverId: Number;
  activeRoomId?: number;
}>();

const emit = defineEmits<{
  (e: "changeRoom", data: RoomInterface): void;
}>();

const createRoomPopup = ref<boolean>(false);
const roomHover = ref<boolean>(false);
const roomId = ref<number | null>(null);
const editMode = ref<boolean>(false);
const createMode = ref<boolean>(false);
const animateAfterCreate = ref<boolean>(false);
const targetDragRoomIndex = ref<number | null>(null);
const draggingRoomIndex = ref<number | null>(null);

watch(
  () => props.roomId,
  () => {
    messageStore.isBeginningConversation = false;
  }
);

function hiddenPopup(data: boolean): void {
  createRoomPopup.value = data;
}

function onHover(id: number) {
  if (!editMode.value) {
    roomId.value = id;
    roomHover.value = true;
  }
}

function onLeave() {
  roomHover.value = false;
}

function startDrag(event: DragEvent, room: RoomInterface) {
  draggingRoomIndex.value = room.index;
}

function enterDrag(event: DragEvent, room: RoomInterface) {
  if (room.index !== draggingRoomIndex.value) {
    targetDragRoomIndex.value = room.index;
  }
}

function onDrop() {
  if (draggingRoomIndex.value && targetDragRoomIndex.value) {
    switchIndex(draggingRoomIndex.value, targetDragRoomIndex.value);
    draggingRoomIndex.value = null;
    targetDragRoomIndex.value = null;
  }
}

function switchIndex(firstRoomIndex: number, secondRoomIndex: number) {
  const firstRoom = roomStore.findRoomByIndex(
    firstRoomIndex,
    Number(props.serverId)
  );
  const secondRoom = roomStore.findRoomByIndex(
    secondRoomIndex,
    Number(props.serverId)
  );

  if (firstRoom && secondRoom) {
    updateRoom(firstRoom, firstRoom.name, secondRoomIndex);
    updateRoom(secondRoom, secondRoom.name, firstRoomIndex);
  }
}

function createRoom(input: HTMLInputElement) {
  if (input.value.length > 30) socketStore.setError("Le nom est trop long");
  socketStore.ioClient?.emit(
    "createRoom",
    {
      name: input.value,
      namespaceId: Number(props.serverId),
    },
    (response: { status: string; message: string }) => {
      if (response.status !== "ok") {
        socketStore.setError(response.message);
      }
      createMode.value = false;
    }
  );
}

function deleteRoom(room: RoomInterface) {
  const rooms = roomStore.getRooms(room.namespaceId);

  if (rooms.length > 1) {
    socketStore.ioClient?.emit(
      "deleteRoom",
      {
        namespaceId: Number(props.serverId),
        id: room.id,
      },
      (response: { status: string; message: string }) => {
        if (response.status !== "ok") {
        }
      }
    );
  }
}

async function updateRoom(
  room: RoomInterface,
  input: HTMLElement | string,
  updateIndex?: number
) {
  await nextTick();

  if (input?.value || updateIndex) {
    socketStore.ioClient?.emit(
      "updateRoom",
      {
        id: room.id,
        index: updateIndex ? updateIndex : room.index,
        namespaceId: room.namespaceId,
        name: updateIndex ? room.name : input?.value,
      },
      (response: { status: string; message: string }) => {
        editMode.value = false;
      }
    );
  }
}
</script>

<template>
  <nav class="nav-container d-flex flex-column flex-fill">
    <div class="create-room d-flex align-items-center">
      <p class="text-room">SALONS TEXTUELS</p>
      <div @click="createMode = true" style="cursor: pointer" class="d-flex">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path
            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
          />
        </svg>
      </div>
    </div>

    <div class="rooms-container drag-zone d-flex flex-column">
      <TransitionGroup name="room">
        <template
          v-for="room of roomStore.getRooms(props.serverId)"
          :key="room.id"
        >
          <router-link
            @mouseover="onHover(room.id)"
            @mouseout="onLeave()"
            :to="{ name: 'server.room', params: { roomId: room.id } }"
            draggable="true"
            @dragstart="startDrag($event, room)"
            @dragenter="enterDrag($event, room)"
            @drop="onDrop()"
            @dragenter.prevent
            @dragover.prevent
          >
            <div
              @click="emit('changeRoom', room)"
              :class="{
                activeRoom: activeRoomId === room.id,
                create:
                  animateAfterCreate && roomStore.activeRoom?.id !== room.id,
              }"
              class="room d-flex flex-column justify-content-center"
            >
              <div
                class="d-flex align-items-center justify-content-space-between"
              >
                <p
                  class="ml-15"
                  :class="{
                    hidden: editMode && roomId === room.id,
                  }"
                >
                  {{ room.name }}
                </p>
                <div
                  class="d-flex align-items-center g-10"
                  :class="{ hidden: editMode && roomId === room.id }"
                >
                  <svg
                    @click.stop.prevent="editMode = true"
                    :class="{
                      editButton: roomHover && roomId === room.id,
                    }"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                    <path
                      d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"
                    />
                  </svg>
                  <svg
                    @click.stop.prevent="deleteRoom(room)"
                    :class="{
                      deleteButton: roomHover && roomId === room.id,
                    }"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                  >
                    <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                    <path
                      d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
                    />
                  </svg>
                </div>
                <EditRoom
                  :room="room"
                  @update="updateRoom"
                  v-if="editMode && roomId === room.id"
                  v-click-outside="() => (editMode = false)"
                />
              </div>
            </div>
          </router-link>
        </template>
      </TransitionGroup>
      <CreateRoom
        v-if="createMode"
        @create="createRoom"
        v-click-outside="() => (createMode = false)"
      />
    </div>
  </nav>
</template>

<style scoped lang="scss">
.nav-container {
  width: 240px;
  background-color: var(--primary-4);
  padding: 10px;

  .rooms-container {
    margin-top: 20px;
    gap: 6px;
  }

  @keyframes room {
    0% {
      opacity: 0;
      transform: translateX(100px);
    }

    25% {
      transform: translateX(75px);
    }

    50% {
      transform: translateX(50px);
    }

    75% {
      transform: translateX(25px);
    }

    100% {
      opacity: 1;
      transform: translateX(0px);
    }
  }

  .create {
    animation: 400ms linear 0ms room;
  }
  .room {
    height: 40px;
    cursor: pointer;
    border-radius: 5px;

    p {
      font-size: 1rem;
      color: var(--text-color);
    }

    &:hover {
      background-color: var(--primary-1);

      p {
        color: var(--text-color-white);
      }
    }

    svg {
      display: none;
    }

    .deleteButton {
      display: block;
      width: 15px;
      height: 15px;
      fill: #eb4144ff;
    }

    .editButton {
      display: block;
      width: 10px;
      height: 10px;
      fill: #236cab;
    }
  }

  .create-room {
    justify-content: space-between;

    .text-room {
      color: var(--text-color);
      font-weight: 500;
      font-size: 0.8rem;
    }

    svg {
      width: 15px;
      height: 15px;
      fill: var(--text-color);
    }
  }

  .hidden {
    display: none;
  }
}

.activeRoom {
  background-color: var(--primary-1);
  p {
    color: var(--text-color-white) !important;
  }
}

.room-enter-active,
.room-leave-active {
  transition: all 0.3s ease;
}
.room-enter-from,
.room-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
