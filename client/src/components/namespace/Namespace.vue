<script setup lang="ts">
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";
import { useSocket } from "@/shared/stores/socketStore";
import { nextTick, ref, watch } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import AddServerPopup from "@/components/namespace/AddServerPopup.vue";
import { useRoute } from "vue-router";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import Burger from "@/components/mobile/Burger.vue";

const socketStore = useSocket();
const namespaceStore = useNamespace();
const roomStore = useRoom();
const route = useRoute();
const addServerPopup = ref<boolean>(false);

const isOpen = ref<boolean>(false);
const isMobile = ref<boolean>(!matchMedia("(min-width: 575px)").matches);

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

function changeNamespace(namespaceId: number, home: boolean = false) {
  if (
    socketStore.activeNsSocket &&
    namespaceId !== Number(route.params.idChannel)
  ) {
    socketStore.activeNsSocket.emit("leaveRoom", roomStore.activeRoom?.id);
  }
  if (home) {
    socketStore.activeNsSocket = null;
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
  () => namespaceStore.isNamespacesLoaded,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      displayTooltip();
    }
  }
);

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
  <nav
    class="namespace-container flex-fill d-flex flex-column align-items-center"
  >
    <Burger
      v-if="isMobile"
      :is-open="isOpen"
      @display="displayNav()"
      @hide="hideNav()"
    />
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
            <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
            <path
              d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"
            />
          </svg>

          <div class="border-bottom"></div>
        </div>
      </router-link>

      <template
        v-for="namespace of namespaceStore.namespaces"
        :key="namespace.id"
      >
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
              loading="lazy"
            />
          </div>
        </router-link>
      </template>

      <div
        v-if="namespaceStore.isNamespacesLoaded"
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
@use "@/assets/mixins.scss";
.namespace-container {
  height: 100%;
  padding: 10px;
  max-width: 70px;
  background-color: var(--primary-3);
  z-index: 2;

  @include mixins.xs {
    display: none;
    position: absolute;
    z-index: 8;
  }

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

    svg {
      fill: var(--yellow);
    }

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

  .active {
    border-radius: 40%;
  }
}

.display {
  display: flex;
}

.hide {
  display: none;
}
</style>
