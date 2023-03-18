<script setup lang="ts">
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import { useMe } from "@/features/me/stores/meStore";
import { getUserAvatar } from "@/utils/getUserAvatar";

const meStore = useMe();
</script>

<template>
  <div class="user-container d-flex align-items-center flex-column">
    <div class="user d-flex flex-column w-100">
      <div class="avatar">
        <img
          :src="
            getUserAvatar(
              meStore.getCurrentRecipient(Number($route.params.privateRoomId))
                .id
            )
          "
          :alt="
            meStore.getCurrentRecipient(Number($route.params.privateRoomId))
              .pseudo
          "
        />
        <div
          :class="{
            online: meStore.currentRecipient?.status === 'online',
            offline: meStore.currentRecipient?.status === 'offline',
          }"
        ></div>
      </div>
      <p class="pseudo mb-5">{{ meStore.currentRecipient?.pseudo }}</p>
      <div class="separator"></div>
      <div>
        <p class="description">Description</p>
        <span>{{
          meStore.currentRecipient?.description ?? "Aucune description"
        }}</span>
      </div>
      <div class="separator"></div>
      <div>
        <p>Membre depuis le</p>
        <span>{{
          new Date(meStore.currentRecipient?.created_at).toLocaleDateString(
            "fr-FR"
          )
        }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";

.user-container {
  padding: 30px 15px;
  gap: 15px;
  width: 280px;
  min-width: 240px;
  background-color: var(--primary-4);

  .user {
    padding: 15px;
    background-color: var(--primary-2);
    border-radius: 10px;

    .avatar {
      position: relative;
      margin: 0 auto;

      img {
        border: 2px solid var(--primary-3);
        width: 60px;
        height: 60px;
        border-radius: 50%;
      }
    }

    p {
      font-size: 1.1rem;
      margin-bottom: 3px;
      color: var(--text-color-white);
      font-weight: 700;
    }

    span {
      font-size: 0.9rem;
      color: var(--text-color-white);
      font-weight: 400;
    }

    .separator {
      margin: 5px 0;
      height: 1px;
      background-color: var(--primary-3);
    }

    .pseudo {
      margin: 0 auto;
    }

    .description {
    }
  }

  @include mixins.xl {
    display: none;
  }

  .online {
    position: absolute;
    bottom: 2px;
    left: 42px;
    background-color: green;
    height: 17px;
    width: 17px;
    border-radius: 100%;
    border: 3px solid var(--primary-2);
    z-index: 5;
  }

  .offline {
    position: absolute;
    bottom: 2px;
    left: 42px;
    background-color: #6d6d6d;
    height: 17px;
    width: 17px;
    border-radius: 100%;
    border: 3px solid var(--primary-2);
    z-index: 5;
  }
}
</style>
