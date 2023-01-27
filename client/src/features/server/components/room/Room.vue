<script setup lang="ts">
import Profil from "@/components/profil/Profil.vue";
import type { RouteParams } from "vue-router";
import type { RoomInterface } from "@/shared/interfaces/Room";
import {
  nextTick,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  toRaw,
  watch,
} from "vue";
import CreateRoomPopup from "./CreateRoomPopup.vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { useRoom } from "@/features/server/stores/roomStore";
import botAvatar from "@/assets/images/bot.png";
import { useMessage } from "@/features/server/stores/messageStore";

const socketStore = useSocket();
const userNsStore = useNsUser();
const roomStore = useRoom();
const messageStore = useMessage();

// Je récupère l'id de mon serveur dans le paramètre de ma route
const props = defineProps<{
  params: RouteParams;
  activeRoomId?: number;
}>();

const emit = defineEmits<{
  (e: "changeRoom", data: RoomInterface): void;
}>();

const createRoomPopup = ref<boolean>(false);
const roomHover = ref<boolean>(false);
const roomId = ref<number | null>(null);
const editMode = ref<boolean>(false);
const inputElem = ref<HTMLInputElement | null>(null);
const targetDragRoomIndex = ref<number | null>(null);
const draggingRoomIndex = ref<number | null>(null);

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
    Number(props.params.idChannel)
  );
  const secondRoom = roomStore.findRoomByIndex(
    secondRoomIndex,
    Number(props.params.idChannel)
  );

  if (firstRoom && secondRoom) {
    updateRoom(firstRoom, secondRoomIndex);
    updateRoom(secondRoom, firstRoomIndex);
  }
}

function deleteRoom(room: RoomInterface) {
  const rooms = roomStore.getRooms(room.namespaceId.toString());

  if (rooms.length > 1) {
    socketStore.activeNsSocket?.emit("deleteRoom", {
      namespaceId: Number(props.params.idChannel),
      id: room.id,
    });
  } else {
    messageStore.messages.push({
      data: "Tu ne peux pas supprimer ce salon",
      dataType: "text",
      authorName: "Chat Bot",
      avatarAuthor: botAvatar,
      roomId: room.id,
      id: -1,
      userId: -1,
      updatedAt: "",
      createdAt: "",
    });
  }
}

async function updateRoom(room: RoomInterface, updateIndex?: number) {
  await nextTick();
  const input = toRaw(inputElem.value) as HTMLInputElement[] | null;

  if ((input && input[0]?.value !== room.name) || updateIndex) {
    socketStore.activeNsSocket?.emit(
      "updateRoom",
      {
        id: room.id,
        index: updateIndex ? updateIndex : room.index,
        namespaceId: room.namespaceId,
        name: updateIndex ? room.name : input![0]?.value,
      },
      (response: { status: string; message: string }) => {}
    );
  }
}
</script>

<template>
  <div class="d-flex flex-column flex-fill">
    <nav class="nav-container d-flex flex-column flex-fill">
      <div class="create-room d-flex align-items-center">
        <p class="text-room">SALONS TEXTUELS</p>
        <div
          @click="createRoomPopup = true"
          style="cursor: pointer"
          class="d-flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path
              d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
            />
          </svg>
        </div>
      </div>

      <CreateRoomPopup
        v-if="createRoomPopup"
        :params="params"
        :create-room-popup="createRoomPopup"
        @room-popup="hiddenPopup"
      />

      <div class="room-container drag-zone d-flex flex-column">
        <template
          v-for="room of roomStore.getRooms(params.idChannel)"
          :key="room.id"
        >
          <router-link
            @mouseover="onHover(room.id)"
            @mouseout="onLeave()"
            :to="{ name: 'room', params: { idRoom: room.id } }"
            draggable="true"
            @dragstart="startDrag($event, room)"
            @dragenter="enterDrag($event, room)"
            @drop="onDrop($event)"
            @dragenter.prevent
            @dragover.prevent
          >
            <div
              @click="emit('changeRoom', room)"
              :class="{ active: activeRoomId === room.id }"
              class="rooms d-flex flex-column justify-content-center"
            >
              <div
                class="d-flex align-items-center justify-content-space-between"
              >
                <p
                  class="ml-15"
                  :class="{ hidden: editMode && roomId === room.id }"
                >
                  {{ room.name }}
                </p>
                <div
                  class="d-flex align-items-center g-10"
                  v-if="userNsStore.checkIfTheUserIsAdmin()"
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
                <div
                  v-if="editMode && roomId === room.id"
                  v-click-outside="() => (editMode = false)"
                  class="edit-room d-flex align-items-center"
                >
                  <div class="input-container d-flex align-items-center">
                    <input
                      v-focus
                      ref="inputElem"
                      class="input-edit-room"
                      type="text"
                      :value="room.name"
                    />
                    <svg
                      @click.stop.prevent="
                        updateRoom(room);
                        editMode = false;
                      "
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                    >
                      <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                      <path
                        d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </template>
      </div>
    </nav>
    <Profil />
  </div>
</template>

<style scoped lang="scss">
.nav-container {
  width: 240px;
  background-color: var(--primary-2);

  .server-name {
    cursor: pointer;
    padding: 15px;
    font-weight: bold;
    text-align: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--primary-3);

    &:hover {
      background-color: #3d4045;
    }

    svg {
      width: 20px;
      height: 20px;
      fill: white;

      path {
        cursor: pointer;
      }
    }
  }

  .room-container {
    gap: 6px;
    padding: 10px 5px 10px 5px;
  }

  .rooms {
    height: 40px;
    cursor: pointer;
    border-radius: 5px;

    &:hover {
      background-color: var(--primary-1);
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
    padding: 20px 15px 3px 6px;

    .text-room {
      font-size: 0.8rem;
    }

    svg {
      width: 15px;
      height: 15px;
      fill: white;
    }
  }

  .edit-room {
    height: 40px;
    width: 230px;

    .input-container {
      height: inherit;
      width: inherit;
      border-radius: 5px;

      background-color: var(--primary-1);

      input {
        padding: 0 0 0 15px;
        height: inherit;
        width: 200px;
        border: 5px;
        font-size: 1rem;
        outline: none;
        border: none;
        color: #f4f4f4;
        background-color: var(--primary-1);
      }

      svg {
        display: block !important;
        fill: green;
        width: 20px;
        height: 20px;
      }
    }
  }

  .hidden {
    display: none;
  }
}
</style>
