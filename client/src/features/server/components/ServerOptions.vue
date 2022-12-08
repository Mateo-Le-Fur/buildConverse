<script setup lang="ts">
import type { Namespace } from "@/shared/interfaces/Namespace";
import type { RouteParams } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import { ref, watchEffect } from "vue";
import UpdateServer from "./UpdateServer.vue";

const socketStore = useSocket();

const props = defineProps<{
  routeParams: RouteParams;
}>();

const popupOption = ref<boolean>(false);
const popupUpdateServer = ref<boolean>(false);
const currentNamespace = ref<Namespace | undefined>();

watchEffect(() => {
  currentNamespace.value = socketStore.currentNamespace(
    props.routeParams.idChannel as string
  );
});

function deleteNamespace(namespaceId: number) {
  socketStore.activeNsSocket.emit(
    "deleteNamespace",
    { id: namespaceId },
    (response: { status: string; message?: string }) => {
      if (response.status !== "ok") {
        socketStore.setError(response.message!);
      }
    }
  );
}

function leaveNamespace(namespaceId: number) {
  socketStore.activeNsSocket.emit(
    "userLeaveNamespace",
    { id: namespaceId },
    (response: { status: string; message: string }) => {
      if (response.status === "ok") {
        socketStore.deleteNamespace({ id: namespaceId });
      }
    }
  );
}
</script>

<template>
  <div class="server-options-container">
    <div
      @click="popupOption = !popupOption"
      class="server-name d-flex align-items-center"
    >
      <p>{{ currentNamespace?.name }}</p>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path
          d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
        />
      </svg>
    </div>
    <div
      v-show="popupOption === true"
      class="p-10 server-options-popup d-flex flex-column"
    >
      <ul>
        <li class="mb-5 p-10 justify-content-center">
          Code d'invitation: {{ currentNamespace?.inviteCode }}
        </li>
        <li
          v-if="currentNamespace?.UserHasNamespace.admin"
          @click="
            (popupUpdateServer = !popupUpdateServer), (popupOption = false)
          "
          class="mb-5 p-10 update-server justify-content-center"
        >
          Modifier le serveur
          <UpdateServer
            @close-popup="popupUpdateServer = false"
            :current-namespace="currentNamespace"
            v-if="popupUpdateServer"
          />
        </li>
        <li
          @click="leaveNamespace(currentNamespace?.id)"
          class="mb-5 p-10 delete-server justify-content-center"
        >
          Quitter le serveur
        </li>
        <li
          v-if="currentNamespace?.UserHasNamespace.admin"
          @click="deleteNamespace(currentNamespace?.id)"
          class="p-10 delete-server justify-content-center"
        >
          Supprimer le serveur
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.server-options-container {
  position: relative;

  .server-name {
    background-color: var(--primary-2);
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
      width: 19px;
      height: 19px;
      fill: white;

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
    background-color: var(--primary-3);
    border-radius: 4px;

    li {
      font-size: 0.9rem;
    }

    .delete-server {
      width: 100%;

      cursor: pointer;

      &:hover {
        background-color: #eb4144ff;
        color: #f4f4f4;
        border-radius: 4px;
      }
    }

    .update-server {
      width: 100%;
      cursor: pointer;

      &:hover {
        background-color: #737ad8;
        border-radius: 4px;
      }
    }
  }
}
</style>
