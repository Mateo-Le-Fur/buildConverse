<script setup lang="ts">
import { ref } from "vue";
import ProfilPopup from "@/features/me/components/profil/ProfilPopup.vue";

const openProfil = ref<boolean>(false);
</script>

<template>
  <ProfilPopup
    v-if="openProfil"
    :is-profil-open="openProfil"
    @close-popup="openProfil = false"
  />
  <div
    @click="openProfil = !openProfil"
    class="d-flex align-items-center profil"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
      <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
      <path
        d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0S96 57.3 96 128s57.3 128 128 128zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
      />
    </svg>
  </div>
</template>

<style lang="scss">
@use "@/assets/mixins.scss";

.profil {
  display: none;
  @include mixins.md {
    display: flex;
    background-color: var(--primary-4);
    padding: 13px;
    border-radius: 50%;
    bottom: 20px;
    right: 10px;
    position: absolute;
    height: 50px;
    width: 50px;
    cursor: pointer;

    svg {
      fill: #f4f4f4;
    }
  }
}
</style>
