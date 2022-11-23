<script setup lang="ts">
import Profil from "@/components/Profil.vue";
import type { RouteParams } from "vue-router";
import type { RoomInterface } from "@/shared/interfaces/Room";
import { ref } from "vue";
import CreateRoomPopup from "./CreateRoomPopup.vue";

// Je récupère l'id de mon serveur dans le paramètre de ma route
const props = defineProps<{
  rooms: RoomInterface[];
  params: RouteParams;
  activeRoomId?: number;
}>();

const createRoomPopup = ref<boolean>(false);

function hiddenPopup(data: boolean): void {
  createRoomPopup.value = data;
}

const emit = defineEmits<{
  (e: "changeRoom", data: RoomInterface): void;
}>();
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

      <template v-for="room of rooms" :key="room.id">
        <router-link :to="{ name: 'room', params: { idRoom: room.id } }">
          <div
            @click="emit('changeRoom', room)"
            :class="{ active: activeRoomId === room.id }"
            class="rooms d-flex flex-column justify-content-center"
          >
            <p>{{ room.name }}</p>
          </div>
        </router-link>
      </template>
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
