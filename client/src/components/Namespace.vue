<script setup lang="ts">
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/dist/svg-arrow.css";
import uploadImgUrl from "@/assets/images/upload.svg";
import { useSocket } from "@/shared/stores/socketStore";
import { ref, watch } from "vue";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { Namespace } from "@/shared/interfaces/Namespace";
import { generateInviteCode } from "@/utils/generateInviteCode";
import Spinner from "@/components/Spinner.vue";

const socketStore = useSocket();

const addServerPopup = ref<boolean>(false);
let src = ref<string | ArrayBuffer | null>();
let namespaceImage = ref<File>();

watch(namespaceImage, (NewValue) => {
  namespaceImage.value = NewValue;
});

watch(
  () => socketStore.isNamespacesLoaded,
  () => {
    setTimeout(() => {
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
    });
  }
);

watch(
  () => socketStore.isNamespaceCreated,
  (newValue) => {
    if (newValue === true) {
      addServerPopup.value = false;
    }
  }
);

function previewAvatar(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files![0];

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    src.value = reader.result;
  };

  namespaceImage.value = file;
}

const validationSchema = toFormValidator(
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "1 caractère minimum : (")
        .max(30, "30 caractères maximum : ("),

      inviteCode: z
        .string()
        .min(8, "8 caractères requis")
        .max(8, " 8 caractères requis"),
    })
    .partial()
    .refine((data) => !!data.name || data.inviteCode)
);

const { handleSubmit, setErrors } = useForm<Namespace>({
  validationSchema,
});

const submitNamespace = handleSubmit((formValue: Namespace) => {
  try {
    if (namespaceImage.value?.size! > 1e7) {
      throw new Error("10Mo Maximum pour la taille des images");
    }
    socketStore.ioClient.emit("createNamespace", {
      name: formValue.name,
      invite_code: generateInviteCode(),
      img_name: namespaceImage.value?.name,
      img_url: namespaceImage.value,
    });
    socketStore.isNamespaceCreated = false;
  } catch (e: any) {
    setErrors({
      name: e.message,
    });
  }
});

const submitInviteCode = handleSubmit((formValue: Partial<Namespace>) => {
  try {
    socketStore.ioClient.emit("invitationToNamespace", {
      inviteCode: formValue.inviteCode,
    });
  } catch (e: any) {
    setErrors({
      inviteCode: e.message,
    });
  }
});

const { value: nameValue, errorMessage: nameError } = useField("name");
const { value: inviteCodeValue, errorMessage: inviteCodeError } =
  useField("inviteCode");

function leaveNamespace(home: boolean = false) {
  if (socketStore.activeNsSocket) {
    socketStore.activeNsSocket.emit("leaveRoom", socketStore.activeRoom?.id);
  }

  if (home) {
    socketStore.activeNsSocket = null;
  }
}
</script>

<template>
  <nav
    v-if="socketStore.isNamespacesLoaded"
    class="namespace-container flex-fill d-flex flex-column align-items-center"
  >
    <div class="scroll d-flex flex-column align-items-center">
      <router-link
        @click="socketStore.activeNsSocket ? leaveNamespace(true) : ''"
        to="/home"
      >
        <div
          data-tooltip="Message Privé"
          class="private-message tooltip"
          :class="{ active: !socketStore.activeNsSocket }"
        >
          <img src="@/assets/images/chat.svg" alt="logo" />

          <div class="border-bottom"></div>
        </div>
      </router-link>

      <template v-for="namespace of socketStore.namespaces" :key="namespace.id">
        <router-link
          :data-tooltip="namespace.name"
          class="tooltip"
          @click="leaveNamespace()"
          :to="`/channels/${namespace.id}/${namespace.rooms[0].id}`"
        >
          <div class="namespace">
            <img
              class="namespace-avatar"
              :class="{
                active: socketStore.activeNsSocket?.nsp == `/${namespace.id}`,
              }"
              :src="'data:image/jpeg;base64,' + namespace.img_url"
              :alt="namespace.name"
            />
          </div>
        </router-link>
      </template>

      <div
        data-tooltip="Ajouter un serveur"
        class="create-namespace align-items-center justify-content-center tooltip"
        @click="addServerPopup = true"
      >
        <div
          class="d-flex align-items-center justify-content-center"
          style="height: inherit; width: inherit"
        >
          <span class="plus">+</span>
        </div>
      </div>
      <div v-if="addServerPopup">
        <Teleport to="body">
          <div @click="addServerPopup = false" class="calc"></div>
        </Teleport>
        <div class="d-flex align-items-center flex-column add-server">
          <h2>Créer un serveur</h2>
          <label for="file" class="label-file">
            <img style="color: white" :src="src ? src : uploadImgUrl" />
          </label>

          <input
            @change="previewAvatar($event)"
            id="file"
            class="input-file"
            type="file"
          />
          <form @submit.prevent="submitNamespace">
            <div class="d-flex flex-column">
              <input
                class="mb-10"
                v-model="nameValue"
                id="name"
                type="text"
                placeholder="Nom du serveur"
              />
              <p class="form-error" v-if="nameError">{{ nameError }}</p>

              <button
                v-if="socketStore.isNamespaceCreated !== false"
                class="mb-20"
              >
                C'est partie !
              </button>
              <div
                class="d-flex align-items-center justify-content-center"
                v-else
              >
                <spinner />
              </div>
            </div>
          </form>

          <form @submit.prevent="submitInviteCode">
            <div class="d-flex flex-column">
              <p>Tu as un code d'invitation ?</p>
              <input
                class="mb-10"
                id="name"
                type="text"
                placeholder="Entre le code"
                v-model="inviteCodeValue"
              />
              <p v-if="inviteCodeError">{{ inviteCodeError }}</p>
              <button>Rejoindre un serveur</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
.namespace-container {
  padding: 10px;
  max-width: 80px;
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

    &:hover {
      border-radius: 40%;
    }
  }

  .add-server {
    gap: 15px;
    background-color: var(--primary-3);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    padding: 25px;
    border-radius: 10px;
    z-index: 10;

    img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
    }

    input {
      font-size: 1rem;
      width: 250px;
      height: 40px;
      outline: none;
      border: none;
      background-color: var(--primary-2);

      &::placeholder {
        font-size: 1rem;
      }
    }

    p {
      margin-bottom: 5px;
    }

    button {
      cursor: pointer;
      width: inherit;
      background-color: #236cab;
      outline: none;
      border: none;
      border-radius: 3px;
      padding: 10px;
      font-size: 1rem;
    }
  }

  .active {
    border-radius: 40%;
  }
}
</style>
