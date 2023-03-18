<script setup lang="ts">
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";
import { useSocket } from "@/shared/stores/socketStore";
import { nextTick, ref, watch } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import AddServerPopup from "@/features/me/components/community/AddServerPopup.vue";
import { useRoute } from "vue-router";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import Burger from "@/components/mobile/Burger.vue";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { getCommunityAvatar } from "@/utils/getCommunityAvatar";

const socketStore = useSocket();
const namespaceStore = useNamespace();
const userNsStore = useNsUser();
const roomStore = useRoom();
const route = useRoute();
const addServerPopup = ref<boolean>(false);

const isOpen = ref<boolean>(false);
const isMobile = ref<boolean>(!matchMedia("(min-width: 575px)").matches);
const avatarURL = import.meta.env.VITE_AVATAR;

function changeNamespace(namespaceId: number) {
  if (namespaceId !== Number(route.params.serverId)) {
    socketStore.ioClient?.emit("leaveRoom", roomStore.activeRoom?.id);
  }
}

function displayNav() {
  const namespaceElem = document.querySelector(".namespace-container");

  namespaceElem?.classList.remove("hide");

  namespaceElem?.classList.add("display");

  isOpen.value = true;
}

function hideNav() {
  const namespaceElem = document.querySelector(".namespace-container");

  namespaceElem?.classList.remove("display");

  namespaceElem?.classList.add("hide");

  isOpen.value = false;
}

watch(
  () => namespaceStore.creatingNamespace,
  async (newValue) => {
    if (!newValue) {
      await nextTick();
      addServerPopup.value = false;
    }
  }
);
</script>

<template>
  <div
    v-for="namespace of namespaceStore.namespaces"
    :key="namespace.id"
    class="namespace-container d-flex flex-column mb-5"
  >
    <router-link
      class="namespace d-flex align-items-center g-10 flex-fill"
      :class="{
        activeNamespace: namespace.id === namespaceStore.activeNamespaceId,
      }"
      @click="changeNamespace(namespace.id)"
      :to="{
        name: 'server.room',
        params: {
          serverId: namespace.id,
          roomId: roomStore.getFirstRoom(namespace.id),
        },
      }"
    >
      <div class="avatar">
        <img :src="getCommunityAvatar(namespace.id)" :alt="namespace.name" />
      </div>
      <div class="d-flex flex-column justify-content-center">
        <p class="name">
          {{ namespace.name }}
        </p>
        <p class="users-number">
          utilisateurs en ligne : {{ namespace.usersOnline }}
        </p>
      </div>
    </router-link>
  </div>
  <div
    @click="isOpen = true"
    class="create-server d-flex align-items-center g-10"
  >
    <div class="add d-flex align-items-center justify-content-center">
      <span>+</span>
    </div>
    <p class="name">Créer une communauté</p>
  </div>
  <AddServerPopup @close-popup="isOpen = false" v-if="isOpen" />
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";

.namespace-container {
  cursor: pointer;
  border-radius: 10px;

  &:hover {
    background-color: var(--primary-1);

    .name {
      color: var(--text-color-white);
      font-weight: 500;
    }

    .users-number {
      color: var(--text-color-white);
    }
  }

  .namespace {
    border-radius: inherit;
    padding: 12px 15px;
    box-shadow: 0 0 2px 0 #a8a8a8;
  }

  .name {
    color: var(--text-color);
    font-weight: 500;
  }

  .users-number {
    color: var(--text-color);
  }

  .avatar {
    img {
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }
  }

  .scroll {
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 0;
      background: transparent;
      display: none;
    }
  }

  .create-namespace {
    display: flex;
    cursor: pointer;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-1);
    color: var(--yellow);

    &:hover {
      border-radius: 40%;
      background-color: var(--yellow);
      color: var(--primary-1) !important;
    }

    span {
      font-size: 1.6rem;
    }
  }

  .namespace-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    cursor: pointer;
    background-color: var(--primary-1);

    &:hover {
      border-radius: 40%;
    }
  }
}

.display {
  display: flex;
}

.hide {
  display: none;
}

.activeNamespace {
  background-color: var(--primary-1);

  p {
    color: var(--text-color-white) !important;
  }
}

.create-server {
  cursor: pointer;
  box-shadow: 0 0 2px 0 #a8a8a8;
  border-radius: 10px;
  padding: 12px 15px;

  &:hover {
    background-color: var(--primary-1);

    p {
      color: var(--text-color-white);
    }

    .add {
      border: 1px solid var(--primary-4);

      span {
        color: var(--text-color-white);
      }
    }
  }

  .add {
    cursor: pointer;
    border: 1px solid var(--primary-2);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    z-index: 2;

    span {
      color: var(--primary-2);
      font-size: 2.4rem;
    }

    &:hover {
      background-color: var(--primary-4);

      span {
        color: var(--primary-2);
      }
    }
  }

  p {
    color: var(--text-color);
  }
}
</style>
