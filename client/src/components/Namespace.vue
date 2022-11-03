<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import { ref } from "vue";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { Namespace } from "@/shared/interfaces/Namespace";
import { generateInviteCode } from "@/utils/generateInviteCode";

const socketStore = useSocket();

const addServerPopup = ref<boolean>(false);

const src = ref<string | ArrayBuffer | null>("");

function addNamespaceAvatar(e: HTMLInputElement & Event) {
  console.log(e);
  const target = e.target as HTMLInputElement;
  const file = target.files[0];

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    src.value = reader.result;
  };
}

const validationSchema = toFormValidator(
  z.object({
    name: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .max(30, "30 caractères maximum : ("),
  })
);

const { handleSubmit, setErrors } = useForm<Namespace>({
  validationSchema,
});

const submit = handleSubmit((formValue: Namespace) => {
  try {
    socketStore.ioClient.emit("createNamespace", {
      name: formValue.name,
      invite_code: generateInviteCode(),
      img: "https://images.unsplash.com/photo-1667143297634-31c6c5f70381?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60",
    });
    // (socketStore.rooms = []),
    //   (socketStore.userList = []),
    //   (socketStore.namespaceSockets = []);
    socketStore.$reset();
    addServerPopup.value = false;
    location.assign("/home");
  } catch (e: string | any) {
    setErrors({
      name: e.message,
    });
  }
});

const { value: nameValue, errorMessage: nameError } = useField("name");

function leaveNamespace() {
  console.log("leave");
  socketStore.activeNsSocket.emit("leaveRoom", socketStore.activeRoom?.id);
}
</script>

<template>
  <nav
    class="namespace-container flex-fill d-flex flex-column align-items-center"
  >
    <router-link
      @click="socketStore.activeNsSocket ? leaveNamespace() : ''"
      to="/home"
    >
      <div class="private-message tooltip">
        <img
          class="namespace-avatar"
          src="@/assets/images/chat.svg"
          alt="logo"
        />
        <div class="right">
          <h3>Message Privé</h3>
          <i></i>
        </div>
        <div class="border-bottom"></div>
      </div>
    </router-link>
    <template v-if="socketStore.namespaces.length">
      <template v-for="namespace of socketStore.namespaces" :key="namespace.id">
        <router-link
          @click="socketStore.activeNsSocket ? leaveNamespace() : ''"
          :to="`/channels/${namespace.id}`"
        >
          <div class="namespace tooltip">
            <img
              class="namespace-avatar"
              :src="`${namespace.img_url}`"
              alt="logo"
            />
            <div class="right">
              <h3>{{ namespace.name }}</h3>
              <i></i>
            </div>
          </div>
        </router-link>
      </template>
    </template>

    <div
      class="create-namespace align-items-center justify-content-center tooltip"
      @click="addServerPopup = true"
    >
      <div class="right">
        <h3>Ajouter un serveur</h3>
        <i></i>
      </div>
      <span>+</span>
    </div>
    <div v-if="addServerPopup">
      <Teleport to="body">
        <div @click="addServerPopup = false" class="calc"></div>
      </Teleport>
      <div class="d-flex align-items-center flex-column add-server">
        <h2>Créer un serveur</h2>
        <label for="file" class="label-file">
          <img
            style="color: white"
            :src="src ? src : 'src/assets/images/upload.svg'"
          />
        </label>

        <input
          @change="addNamespaceAvatar($event)"
          id="file"
          class="input-file"
          type="file"
        />
        <form @submit.prevent="submit">
          <div class="d-flex flex-column">
            <label for="name">Nom du serveur</label>
            <input class="mb-10" v-model="nameValue" id="name" type="text" />
            <p class="form-error" v-if="nameError">{{ nameError }}</p>

            <button class="mb-20">C'est partie !</button>
          </div>
        </form>

        <div class="d-flex flex-column">
          <p>Tu as un code d'invitation ?</p>
          <button>Rejoindre un serveur</button>
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

  .private-message {
    cursor: pointer;
    height: 50px;
    width: 50px;
    margin-bottom: 20px;

    .border-bottom {
      padding-top: 4px;
      width: 70%;
      margin: auto;
      border-bottom: 2px solid var(--primary-1);
      border-radius: 5px;
    }
  }

  .namespace {
    height: 50px;
    width: 50px;
    margin-bottom: 10px;
  }

  .tooltip {
    display: inline-block;
    position: relative;
    text-align: center;
  }

  .tooltip .right {
    min-width: 160px;
    top: 50%;
    left: 100%;
    margin-left: 20px;
    transform: translate(0, -50%);
    padding: 10px 20px;
    color: white;
    background-color: var(--primary-3);
    font-size: 13px;
    border-radius: 8px;
    position: absolute;
    z-index: 99999999;
    display: none;
  }

  .tooltip:hover .right {
    display: block;
  }

  .tooltip .right i {
    position: absolute;
    top: 50%;
    right: 100%;
    margin-top: -12px;
    width: 12px;
    height: 24px;
    overflow: hidden;
  }

  .tooltip .right i::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    left: 0;
    top: 50%;
    transform: translate(50%, -50%) rotate(-45deg);
    background-color: var(--primary-3);
  }

  .create-namespace {
    display: flex;
    cursor: pointer;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-1);

    span {
      color: white;
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
    color: white;
    background-color: var(--primary-3);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 350px;
    padding: 15px;
    border-radius: 10px;
    z-index: 10;

    img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
    }

    label {
      color: white;
      margin-bottom: 3px;
    }

    input {
      color: white;
      outline: none;
      border: none;
      background-color: var(--primary-2);
    }

    p {
      margin-bottom: 15px;
    }

    button {
      cursor: pointer;
      width: 190px;
      color: white;
      background-color: #236cab;
      outline: none;
      border: none;
      border-radius: 3px;
      padding: 10px;
      font-size: 1rem;
    }
  }
}
</style>
