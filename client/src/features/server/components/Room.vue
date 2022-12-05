<script setup lang="ts">
import Profil from "@/components/Profil.vue";
import type { RouteParams } from "vue-router";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { onMounted, ref } from "vue";
import CreateRoomPopup from "./CreateRoomPopup.vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useNsUser } from "@/features/server/stores/userNsStore";

const socketStore = useSocket();
const userNsStore = useNsUser();

// Je récupère l'id de mon serveur dans le paramètre de ma route
const props = defineProps<{
  rooms: RoomInterface[];
  params: RouteParams;
  activeRoomId?: number;
}>();

const emit = defineEmits<{
  (e: "changeRoom", data: RoomInterface): void;
}>();

const createRoomPopup = ref<boolean>(false);
const roomHover = ref<boolean>(false);
const roomId = ref<number | null>(null);
function hiddenPopup(data: boolean): void {
  createRoomPopup.value = data;
}

function onHover(id: number) {
  roomId.value = id;
  roomHover.value = true;
}

function onLeave() {
  roomId.value = null;
  roomHover.value = false;
}

function deleteRoom(roomId: number) {
  socketStore.activeNsSocket.emit("deleteRoom", {
    namespaceId: Number(props.params.idChannel),
    id: roomId,
  });
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

      <div class="room-container d-flex flex-column">
        <template v-for="room of rooms" :key="room.id">
          <router-link
            @mouseover="onHover(room.id)"
            @mouseout="onLeave()"
            :to="{ name: 'room', params: { idRoom: room.id } }"
          >
            <div
              @click="emit('changeRoom', room)"
              :class="{ active: activeRoomId === room.id }"
              class="rooms d-flex flex-column justify-content-center"
            >
              <div
                class="d-flex align-items-center justify-content-space-between"
              >
                <p>{{ room.name }}</p>
                <svg
                  v-if="userNsStore.checkIfTheUserIsAdmin()"
                  @click.stop.prevent="deleteRoom(room.id)"
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
    padding: 0 15px;
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
}
</style>
