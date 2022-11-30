<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { useUser } from "@/shared/stores";
import { useRouter } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import type { User } from "@/shared/interfaces/User";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import { deleteUser, fetchCurrentUser } from "@/shared/services";

const userStore = useUser();
const socketStore = useSocket();
const router = useRouter();

const state = reactive<{
  isProfilOpen: boolean;
  user: Partial<User> | null;
}>({
  isProfilOpen: false,
  user: null,
});
let avatar = ref<File | null>();
let src = ref<string | ArrayBuffer | null>();

async function logout() {
  await userStore.logout();
  socketStore.ioClient?.disconnect();
  socketStore.namespaceSockets.forEach((nsSocket: any) => {
    nsSocket.disconnect();
  });
  socketStore.$reset();
  userStore.$reset();
  await router.push("/connexion");
}

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
  const namespacesId: number[] = [];
  socketStore.namespaces.forEach((ns) => {
    namespacesId.push(ns.id);
  });
  await deleteUser(userStore.currentUser?.id);

  socketStore.ioClient?.emit("deleteUser", {
    namespacesId,
    id: userStore.currentUser?.id,
  });

  router.push("/connexion");

  userStore.$reset();
  socketStore.$reset();
}

watch(
  () => state.isProfilOpen,
  () => {
    pseudoValue.value = userStore.currentUser?.pseudo;
    emailValue.value = userStore.currentUser?.email;
    state.user = { description: userStore.currentUser!.description };
  }
);

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
      const namespaces = socketStore.namespaces.map((ns) => {
        return ns.id;
      });

      socketStore.ioClient?.emit("updateUser", {
        pseudo: formValue.pseudo,
        email: formValue.email,
        description: description.value,
        namespaces,
        userId: userStore.currentUser?.id,
        avatar: avatar.value ? avatar.value : null,
        avatarName: avatar.value ? avatar.value?.name : null,
      });

      avatar.value = null;
      state.isProfilOpen = false;
    }
  } catch (e: string | any) {
    setErrors({});
  }
});

const { value: pseudoValue, errorMessage: pseudoError } = useField("pseudo");
const { value: emailValue, errorMessage: emailError } = useField("email");
</script>

<template>
  <div class="profil-container d-flex align-items-center">
    <img
      :src="'data:image/jpeg;base64,' + userStore.currentUser?.avatar_url"
      alt=""
    />
    <p>{{ userStore.currentUser?.pseudo }}</p>
    <div class="d-flex flex-fill justify-content-end">
      <div class="settings d-flex justify-content-end">
        <svg
          @click="state.isProfilOpen = !state.isProfilOpen"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
        >
          <path
            d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336c44.2 0 80-35.8 80-80s-35.8-80-80-80s-80 35.8-80 80s35.8 80 80 80z"
          />
        </svg>
        <div v-if="state.isProfilOpen" class="d-flex flex-column profil-popup">
          <div class="d-flex flex-column profil-content">
            <div class="d-flex flex-column align-items-center">
              <label for="file" class="label-file">
                <img
                  class="avatar"
                  :src="
                    src
                      ? src
                      : 'data:image/jpeg;base64,' +
                        userStore.currentUser?.avatar_url
                  "
                />
              </label>
              <input
                @change="previewAvatar($event)"
                id="file"
                class="input-file"
                type="file"
              />

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
                      v-model="state.user.description"
                      form="usrForm"
                      id="description"
                    ></textarea>
                  </div>
                </div>
                <div class="d-flex g-15">
                  <button class="update">Sauvegarder mes informations</button>
                  <button
                    type="button"
                    @click="state.isProfilOpen = false"
                    class="back"
                  >
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
              @click="logout()"
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
      </div>
    </div>
    <div class="status"></div>
  </div>
</template>

<style scoped lang="scss">
.profil-container {
  position: relative;
  background-color: #292b2f;
  padding: 8px;

  img {
    margin: 0px 10px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
  }

  svg {
    padding: 5px;
    width: 30px;
    height: 30px;
    fill: #969896;

    &:hover {
      background-color: var(--primary-1);
      border-radius: 3px;
    }
  }

  .status {
    position: absolute;
    bottom: 5px;
    left: 35px;
    background-color: green;
    height: 15px;
    width: 15px;
    border-radius: 100%;
    border: 3px solid var(--primary-2);
  }

  .settings {
    position: relative;

    svg {
      cursor: pointer;
    }
  }

  .profil-popup {
    overflow-y: auto;
    overflow-x: hidden;
    position: absolute;
    bottom: 60px;
    padding: 15px;
    left: -195px;
    height: 450px;
    width: 524px;
    background-color: #282a2f;
    z-index: 2;
    border-radius: 4px;
    box-shadow: 3px 0px 10px 4px rgba(0, 0, 0, 0.5);

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-track {
      box-shadow: inset 0 0 10px 10px var(--primary-1);
      border: solid 3px transparent;
    }

    &::-webkit-scrollbar-thumb {
      box-shadow: inset 0 0 10px 10px var(--primary-3);
      border: solid 3px transparent;
    }

    .profil-content {
      position: relative;
      gap: 15px;

      .avatar {
        width: 80px;
        height: 80px;
      }

      .profil-content-pseudo {
        width: 45%;

        label {
          color: #f4f4f4;
        }

        input {
          outline: none;
          background-color: #1f2023;
          color: #f4f4f4;
          font-size: 1.1rem;
        }
      }
      .profil-content-email {
        width: 45%;

        label {
          color: #f4f4f4;
        }
        input {
          outline: none;
          background-color: #1f2023;
          color: #f4f4f4;
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
      background-color: #236cab;
    }

    .back {
      text-align: center;
      width: 150px;
      cursor: pointer;
      border: none;
      outline: none;
      padding: 15px 10px;
      border-radius: 5px;
      background-color: crimson;
    }

    .danger-line {
      width: 90%;
      border-top: 1px solid #e10c0c;
      margin-top: 50px;
      padding-top: 30px;

      .delete-account {
        text-align: center;
        width: 150px;
        cursor: pointer;
        border: none;
        outline: none;
        padding: 15px 10px;
        border-radius: 5px;
        background-color: #e10c0c;
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
        fill: #f4f4f4;

        &:hover {
          fill: crimson;
        }
      }
    }
  }
}
</style>
