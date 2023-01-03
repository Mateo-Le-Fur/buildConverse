<script setup lang="ts">
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";
import { useSocket } from "@/shared/stores/socketStore";
import { nextTick, ref, watch } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import AddServerPopup from "@/components/AddServerPopup.vue";
import { useRoute } from "vue-router";

const socketStore = useSocket();
const roomStore = useRoom();
const route = useRoute();
const addServerPopup = ref<boolean>(false);

function displayTooltip(): void {
  const anchorElem = [
    ...document.querySelectorAll(".tooltip"),
  ] as HTMLAnchorElement[];

  for (let i = 0; i < anchorElem.length; i++) {
    tippy(anchorElem[i], {
      content: anchorElem[i].dataset.tooltip as string,
      allowHTML: true,
      arrow: true,
      placement: "right",
      offset: [0, 20],
      maxWidth: 250,
      theme: "custom",
    });
  }
}

watch(
  () => socketStore.isNamespacesLoaded,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      displayTooltip();
    }
  }
);

watch(
  () => socketStore.creatingNamespace,
  async (newValue) => {
    if (newValue === false) {
      await nextTick();
      addServerPopup.value = false;
      displayTooltip();
    }
  }
);

function changeNamespace(namespaceId: number, home: boolean = false) {
  if (
    socketStore.activeNsSocket &&
    namespaceId !== Number(route.params.idChannel)
  ) {
    socketStore.activeNsSocket.emit("leaveRoom", roomStore.activeRoom?.id);
  }
  if (home) {
    socketStore.activeNsSocket = null;
    socketStore.isMessagesLoaded = false;
  }
}
</script>

<template>
  <nav
    class="namespace-container flex-fill d-flex flex-column align-items-center"
  >
    <div class="scroll d-flex flex-column align-items-center">
      <router-link
        @click="socketStore.activeNsSocket ? changeNamespace(null, true) : ''"
        to="/channels/me"
      >
        <div
          data-tooltip="Messages Privés"
          class="private-message tooltip"
          :class="{ active: !socketStore.activeNsSocket }"
        >
          <!--          <img src="@/assets/images/chat.svg" alt="logo" />-->
          <img src="@/assets/images/chat.svg" alt="logo" />

          <div class="border-bottom"></div>
        </div>
      </router-link>

      <template v-for="namespace of socketStore.namespaces" :key="namespace.id">
        <router-link
          :data-tooltip="namespace.name"
          class="tooltip"
          @click="changeNamespace(namespace.id)"
          :to="`/channels/${namespace.id}/${roomStore.getFirstRoom(
            namespace.id
          )}`"
        >
          <div class="namespace">
            <img
              class="namespace-avatar"
              :class="{
                active: socketStore.activeNsSocket?.nsp == `/${namespace.id}`,
              }"
              :src="namespace.imgUrl"
              :alt="namespace.name"
            />
          </div>
        </router-link>
      </template>

      <div
        v-if="socketStore.isNamespacesLoaded"
        data-tooltip="Ajouter un serveur"
        class="create-namespace align-items-center justify-content-center tooltip"
        @click.stop="addServerPopup = true"
      >
        <div
          class="d-flex align-items-center justify-content-center"
          style="height: inherit; width: inherit"
        >
          <span class="plus">+</span>
        </div>
        <Teleport to="body">
          <AddServerPopup
            @close-popup="addServerPopup = false"
            v-if="addServerPopup"
          />
        </Teleport>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.namespace-container {
  padding: 10px;
  max-width: 70px;
  background-color: var(--primary-3);

  .scroll {
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 0;
      background: transparent;
      display: none;
    }
  }

  .private-message {
    cursor: pointer;
    height: 50px;
    width: 50px;
    margin-bottom: 20px;
    background-color: var(--primary-2);
    border: 8px solid var(--primary-2);
    border-radius: 50%;

    &:hover {
      border-radius: 40%;
    }

    .border-bottom {
      padding-top: 11px;
      width: 80%;
      margin: auto;
      border-bottom: 2px solid var(--primary-1);
    }
  }

  .namespace {
    height: 50px;
    width: 50px;
    margin-bottom: 10px;
  }

  .create-namespace {
    display: flex;
    cursor: pointer;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-1);
    color: #f4f4f4;

    &:hover {
      border-radius: 40%;
      background-color: #f4f4f4;
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

  .active {
    border-radius: 40%;
  }
}
</style>
