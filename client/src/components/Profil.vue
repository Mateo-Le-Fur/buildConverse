<script setup lang="ts">
import { reactive } from "vue";
import { useUser } from "@/shared/stores";
import { useRouter } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";

const state = reactive<{
  isProfilOpen: boolean;
}>({
  isProfilOpen: false,
});

const userStore = useUser();
const socketStore = useSocket();
const router = useRouter();

async function logout() {
  await userStore.logout();
  socketStore.ioClient.emit("leave");
  socketStore.$reset();
  await router.push("/connexion");
}
</script>

<template>
  <div class="profil-container d-flex align-items-center">
    <img
      src="https://images.unsplash.com/photo-1666797698030-15a431eea3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
      alt=""
    />
    <p>{{ userStore.currentUser.pseudo }}</p>
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
            <div class="d-flex align-items-center">
              <label for="file" class="label-file">
                <img
                  class="avatar"
                  src="https://images.unsplash.com/photo-1666797698030-15a431eea3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                />
              </label>
              <input id="file" class="input-file" type="file" />
              <p class="profil-content-pseudo">
                {{ userStore.currentUser.pseudo }}
              </p>
            </div>
            <button
              @click="logout(), (state.isProfilOpen = false)"
              class="logout mb-20"
            >
              Déconnexion
            </button>
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
    position: absolute;
    top: -370px;
    padding: 15px;
    right: -100px;
    height: 350px;
    width: 350px;
    background-color: #282a2f;
    z-index: 2;
    border-radius: 10px;

    .profil-content {
      gap: 15px;

      .avatar {
        width: 80px;
        height: 80px;
      }

      .profil-content-pseudo {
        font-size: 1.5rem;
      }
    }

    .logout {
      text-align: center;
      width: 150px;
      text-align: center;
      cursor: pointer;
      border: none;
      outline: none;
      padding: 15px 10px;
      border-radius: 5px;
      background-color: #d50707;
    }
  }
}
</style>
