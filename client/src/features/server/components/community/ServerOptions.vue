<script setup lang="ts">
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { RouteParams } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import { ref, watchEffect } from "vue";
import UpdateServer from "./UpdateServer.vue";
import { useNamespace } from "@/features/server/stores/namespaceStore";

const socketStore = useSocket();
const namespaceStore = useNamespace();

const props = defineProps<{
  serverId: number;
}>();

const popupOptions = ref<boolean>(false);
const popupUpdateServer = ref<boolean>(false);
const currentNamespace = ref<Namespace | undefined>();

watchEffect(() => {
  currentNamespace.value = namespaceStore.currentNamespace(props.serverId);
});

function closePopupOptions() {
  popupOptions.value = false;
}

function closePopupUpdate() {
  socketStore.error = null;
  popupUpdateServer.value = false;
}

function deleteNamespace(namespaceId: number) {
  socketStore.ioClient?.emit(
    "deleteNamespace",
    namespaceId,
    (response: { status: string; message?: string }) => {
      if (response.status !== "ok") {
        socketStore.setError(response.message!);
      }
    }
  );
}

function leaveNamespace(namespaceId: number) {
  socketStore.ioClient?.emit(
    "userLeaveNamespace",
    namespaceId,
    (response: { status: string; message: string }) => {
      if (response.status === "ok") {
        namespaceStore.deleteNamespace({ id: namespaceId });
      }
    }
  );
}
</script>

<template>
  <div class="server-options-container">
    <div
      @click="popupOptions = true"
      class="server-name d-flex align-items-center"
    >
      <h3>{{ currentNamespace?.name }}</h3>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
        />
      </svg>
    </div>
    <div class="separator"></div>
    <div
      v-if="popupOptions"
      v-click-outside="() => closePopupOptions()"
      class="p-10 server-options-popup d-flex flex-column"
    >
      <ul>
        <li class="mb-5 p-10 justify-content-center">
          Code d'invitation:
          <span class="invite_code">{{ currentNamespace?.inviteCode }}</span>
        </li>
        <li
          v-if="currentNamespace?.UserHasNamespace.admin"
          @click="(popupUpdateServer = !popupUpdateServer), closePopupOptions()"
          class="mb-5 p-10 update-server justify-content-center"
        >
          Modifier le serveur
        </li>
        <li
          @click="leaveNamespace(currentNamespace?.id), closePopupOptions()"
          class="mb-5 p-10 delete-server justify-content-center"
        >
          Quitter le serveur
        </li>
        <li
          v-if="currentNamespace?.UserHasNamespace.admin"
          @click="deleteNamespace(currentNamespace?.id), closePopupOptions()"
          class="p-10 delete-server justify-content-center"
        >
          Supprimer le serveur
        </li>
      </ul>
    </div>
  </div>
  <Teleport to="body">
    <UpdateServer
      v-if="popupUpdateServer"
      @close-popup="closePopupUpdate()"
      :current-namespace="currentNamespace"
    />
  </Teleport>
</template>

<style scoped lang="scss">
.server-options-container {
  padding: 10px;
  position: relative;
  color: var(--text-color);

  .separator {
    width: 95%;
    height: 1px;
    background-color: var(--primary-2);
    margin: 0 auto;
  }

  .server-name {
    margin-bottom: 5px;
    padding: 0 8px;
    min-height: 55px;
    background-color: var(--primary-4);
    cursor: pointer;
    font-weight: bold;
    text-align: center;
    justify-content: space-between;

    h3 {
      color: var(--text-color);
    }

    &:hover {
      background-color: var(--primary-2);
      border-radius: 10px;

      h3 {
        color: var(--text-color-white);
      }

      svg {
        fill: var(--text-color-white);
      }
    }

    svg {
      width: 19px;
      height: 19px;
      fill: var(--text-color);

      path {
        cursor: pointer;
      }
    }
  }

  .server-options-popup {
    top: 55px;
    left: 50%;
    transform: translateX(-50%);
    position: absolute;
    width: 220px;
    background-color: var(--primary-4);
    border-radius: 4px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;

    .invite_code {
      color: #0072bb;
      font-weight: 700;
    }

    li {
      font-size: 0.9rem;
      color: var(--text-color);
    }

    .delete-server {
      width: 100%;

      cursor: pointer;

      &:hover {
        background-color: var(--danger-2);
        color: #f4f4f4;
        border-radius: 4px;
      }
    }

    .update-server {
      width: 100%;
      cursor: pointer;

      &:hover {
        color: var(--primary-4);
        background-color: var(--primary-2);
        border-radius: 4px;
      }
    }
  }
}
</style>
