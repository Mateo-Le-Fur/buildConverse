<script setup lang="ts">
import { reactive } from "vue";
import { useUser } from "@/shared/stores";

import ProfilPopup from "@/features/me/components/profil/ProfilPopup.vue";

const userStore = useUser();

const state = reactive<{
  isProfilOpen: boolean;
  isIconClicked: boolean;
}>({
  isProfilOpen: false,
  isIconClicked: false,
});

function resetClick() {
  setTimeout(() => {
    state.isIconClicked = false;
  }, 40);
}
</script>

<template>
  <div class="profil-container d-flex align-items-center">
    <div
      @click="state.isProfilOpen = true"
      class="profil d-flex align-items-center"
    >
      <img :src="userStore.currentUser?.avatarUrl" alt="" />
      <div class="status-container d-flex flex-column">
        <p class="pseudo">{{ userStore.currentUser?.pseudo }}</p>
        <p class="status">
          {{
            userStore.currentUser?.status === "online"
              ? "En ligne"
              : "Hors ligne"
          }}
        </p>
      </div>
      <div class="status-indicator"></div>
    </div>
    <div class="d-flex flex-fill justify-content-end">
      <router-link to="/channels/me">
        <div class="settings d-flex align-items-center justify-content-center">
          <svg
            @click="(state.isIconClicked = true), resetClick()"
            :class="{ scale: state.isIconClicked }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"
            />
          </svg>
        </div>
      </router-link>
    </div>
    <ProfilPopup
      v-if="state.isProfilOpen"
      @close-popup="state.isProfilOpen = false"
      :is-profil-open="state.isProfilOpen"
    />
  </div>
</template>

<style scoped lang="scss">
.scale {
  transform: scale(1.1);
}

.profil-container {
  min-height: 70px;
  background-color: var(--primary-4);
  padding: 8px 30px 8px 8px;

  .profil {
    position: relative;
  }

  & > div:first-child {
    border: 1px solid var(--primary-4);
    padding: 5px 10px 5px 5px;

    &:hover {
      cursor: pointer;
      border-radius: 10px;
      background-color: var(--gray-2);
    }
  }

  .status-container {
    p {
      color: var(--text-color);
    }

    .pseudo {
      font-weight: 500;
      font-size: 20px;
    }

    .status {
      font-size: 12px;
    }
  }

  img {
    margin: 0px 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  svg {
    padding: 5px;
    width: 40px;
    height: 40px;
    fill: var(--primary-2);
  }

  .status-indicator {
    position: absolute;
    bottom: 0;
    left: 37px;
    background-color: green;
    height: 20px;
    width: 20px;
    border-radius: 100%;
    border: 3px solid var(--primary-4);
  }

  .settings {
    position: relative;
    border-radius: 50%;
    border: 1px solid hsla(211, 96%, 62%, 1);
    svg {
      cursor: pointer;
    }

    &:hover {
      background: var(--primary-2);

      svg {
        fill: var(--text-color-white);
      }
    }
  }
}
</style>
