<script setup lang="ts">
import { useUser } from "@/shared/stores";
import { useSocket } from "@/shared/stores/socketStore";
import { useNamespace } from "@/features/server/stores/namespaceStore";
import { useMe } from "@/features/home/stores/meStore";
import { useRouter } from "vue-router";
import { reactive, ref, watch, watchEffect } from "vue";
import type { User } from "@/shared/interfaces/User";
import { deleteUser } from "@/shared/services";
import { getActivePinia } from "pinia";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";

const userStore = useUser();
const socketStore = useSocket();
const namespaceStore = useNamespace();
const meStore = useMe();
const router = useRouter();

let avatar = ref<File | null>();
let src = ref<string | ArrayBuffer | null>();

const description = ref<string | undefined>(undefined);

const props = defineProps<{
  isProfilOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

function previewAvatar(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files![0];

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    src.value = reader.result;
  };

  avatar.value = file;
}

async function deleteAccount() {
  const namespacesId = namespaceStore.namespaces.map(
    (namespace) => namespace.id
  );
  const privateRoomsId = meStore.recipients.map(
    (recipient) => recipient.privateRoomId
  );

  await deleteUser(userStore.currentUser?.id);

  socketStore.ioClient?.emit("deleteUser", {
    namespacesId,
    privateRoomsId,
    id: userStore.currentUser?.id,
  });

  socketStore.ioClient?.disconnect();

  // @ts-ignore
  getActivePinia()._s.forEach((store) => store.$reset());

  await router.push("/connexion");
}

watch(avatar, (NewValue) => {
  avatar.value = NewValue;
});

const validationSchema = toFormValidator(
  z.object({
    pseudo: z.string({ required_error: "Le champ doit être remplie : (" }),

    email: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .email("Le format de l'email n'est pas valide : ("),
  })
);

const { handleSubmit, setErrors } = useForm<User>({
  validationSchema,
});

const submit = handleSubmit(async (formValue: User) => {
  try {
    const description = document.getElementById(
      "description"
    ) as HTMLTextAreaElement;

    if (
      formValue.pseudo !== userStore.currentUser?.pseudo ||
      formValue.email !== userStore.currentUser?.email ||
      description.value !== userStore.currentUser?.description ||
      avatar.value
    ) {
      const namespaces = namespaceStore.namespaces.map((ns) => ns.id);
      const friends = meStore.friends?.map((friend) => friend.id);

      socketStore.ioClient?.emit(
        "updateUser",
        {
          pseudo: formValue.pseudo,
          email: formValue.email,
          description: description.value,
          namespaces,
          friends,
          imgBuffer: avatar.value ? avatar.value : null,
        },
        async (response: { status: string; message: string }) => {
          if (response.status === "ok") {
            await userStore.fetchCurrentUser();
            emit("closePopup");
            avatar.value = null;
            src.value = null;
          } else {
            socketStore.setError(response.message);
          }
        }
      );
    }
  } catch (e: string | any) {
    setErrors({});
  }
});

const { value: pseudoValue, errorMessage: pseudoError } = useField("pseudo");
const { value: emailValue, errorMessage: emailError } = useField("email");

watchEffect(() => {
  if (props.isProfilOpen) {
    socketStore.error = null;
    pseudoValue.value = userStore.currentUser?.pseudo;
    emailValue.value = userStore.currentUser?.email;
    description.value = userStore.currentUser?.description;
  }
});
</script>

<template>
  <div
    v-click-outside="() => emit('closePopup')"
    class="d-flex flex-column profil-popup"
  >
    <div class="d-flex flex-column profil-content">
      <div class="d-flex flex-column align-items-center">
        <label for="file" class="label-file">
          <img
            class="avatar"
            :src="src ? src : userStore.currentUser?.avatarUrl"
          />
        </label>
        <input
          @change="previewAvatar($event)"
          id="file"
          class="input-file"
          type="file"
        />
        <span class="form-error mb-10" v-if="socketStore.error">{{
          socketStore.error
        }}</span>
        <form
          id="usrForm"
          @submit.prevent="submit"
          class="d-flex flex-column align-items-center"
        >
          <div class="d-flex justify-content-center g-15 mb-10">
            <div class="d-flex flex-column profil-content-pseudo">
              <label for="pseudo">Pseudo</label>
              <input
                id="pseudo"
                type="text"
                autocomplete="off"
                v-model="pseudoValue"
              />
            </div>
            <div class="d-flex flex-column profil-content-email">
              <label for="pseudo">Email</label>
              <input
                id="pseudo"
                type="text"
                autocomplete="off"
                v-model="emailValue"
              />
            </div>
          </div>
          <div
            class="d-flex justify-content-center align-items-center profil-content-description"
          >
            <div class="d-flex flex-column w-100 mb-10">
              <label for="description">Description</label>
              <textarea
                v-model="description"
                form="usrForm"
                id="description"
              ></textarea>
            </div>
          </div>
          <div class="d-flex g-15">
            <button class="update">Sauvegarder mes informations</button>
            <button type="button" @click="emit('closePopup')" class="back">
              Ne rien changer
            </button>
          </div>
          <div class="d-flex justify-content-center w-100 danger-line">
            <button
              @click="deleteAccount()"
              class="delete-account"
              type="button"
            >
              Supprimer le compte
            </button>
          </div>
        </form>
      </div>
      <div
        @click="userStore.logout()"
        class="logout d-flex align-items-center justify-content-center"
      >
        <svg
          style="width: 35px; height: 35px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
          <path
            d="M160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96C43 32 0 75 0 128V384c0 53 43 96 96 96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H96c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32h64zM504.5 273.4c4.8-4.5 7.5-10.8 7.5-17.4s-2.7-12.9-7.5-17.4l-144-136c-7-6.6-17.2-8.4-26-4.6s-14.5 12.5-14.5 22v72H192c-17.7 0-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32H320v72c0 9.6 5.7 18.2 14.5 22s19 2 26-4.6l144-136z"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";
.profil-popup {
  overflow-y: auto;
  overflow-x: hidden;
  position: absolute;
  bottom: 60px;
  padding: 15px;
  left: -195px;
  height: 450px;
  width: 524px;
  background-color: var(--primary-3);
  z-index: 2;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.24) 0 3px 8px;

  @include mixins.md {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 450px;
    width: 350px;
  }

  input {
    border: 1px solid var(--yellow);

    @include mixins.md {
      font-size: 0.9rem !important;
    }
  }

  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
    display: none;
  }

  .profil-content {
    position: relative;
    gap: 15px;

    .avatar {
      border-radius: 50%;
      width: 80px;
      height: 80px;
    }

    .profil-content-pseudo {
      width: 45%;

      label {
        color: #f0f0f0;
      }

      input {
        width: 100%;
        outline: none;
        background-color: #1f2023;
        color: #f0f0f0;
        font-size: 1.1rem;
      }
    }

    .profil-content-email {
      width: 45%;

      label {
        color: #f0f0f0;
      }

      input {
        outline: none;
        background-color: #1f2023;
        color: #f0f0f0;
        font-size: 1.1rem;
      }
    }

    .profil-content-description {
      width: calc(90% + 15px);

      label {
        color: #f4f4f4;
      }

      textarea {
        width: 100%;
        height: 120px;
        outline: none;
        resize: none;
        background-color: #1f2023;
        border: 1px solid var(--yellow);
      }
    }
  }

  .update {
    //margin-bottom: 160px;
    text-align: center;
    width: 150px;
    cursor: pointer;
    border: none;
    outline: none;
    padding: 15px 10px;
    border-radius: 5px;
    color: black;
    background-color: var(--yellow);
  }

  .back {
    text-align: center;
    width: 150px;
    cursor: pointer;
    border: none;
    outline: none;
    padding: 15px 10px;
    border-radius: 5px;
    background-color: var(--danger-2);
  }

  .danger-line {
    width: 90%;
    border-top: 1px solid #f24333;
    margin-top: 50px;
    padding-top: 30px;

    .delete-account {
      font-weight: 500;
      text-align: center;
      width: 150px;
      cursor: pointer;
      border: none;
      outline: none;
      padding: 15px 10px;
      border-radius: 5px;
      background-color: #f24333;
    }
  }

  .logout {
    right: 0;
    position: absolute;
    text-align: center;
    width: 40px;
    height: 40px;
    cursor: pointer;
    border-radius: 3px;
    background-color: var(--primary-1);

    svg {
      fill: #f0f0f0;

      &:hover {
        fill: var(--danger-2);
      }
    }
  }
}
</style>
