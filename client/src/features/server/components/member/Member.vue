<script setup lang="ts">
import { getUserAvatar } from "@/utils/getUserAvatar";
import type { User } from "@/shared/interfaces/User";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";

defineProps<{
  member: User | FriendsInterface;
}>();

const emit = defineEmits<{
  (e: "viewProfil", user: User | FriendsInterface): void;
}>();
</script>

<template>
  <div class="member d-flex align-items-center g-15">
    <img :src="getUserAvatar(member.id)" :alt="member.pseudo" />
    <p :class="{ admin: member.UserHasNamespace?.admin }">
      {{ member.pseudo }}
    </p>
    <div class="d-flex flex-fill justify-content-end">
      <button @click="emit('viewProfil', member)" class="view-profil">
        Voir le profil
      </button>
    </div>
    <div
      :class="{
        online: member.status === 'online',
        offline: member.status === 'offline',
      }"
    ></div>
  </div>
</template>

<style scoped lang="scss">
.member {
  max-height: 80px;
  padding: 0.4rem;
  background-color: var(--primary-4);
  border: 1px solid var(--primary-2);
  border-radius: 10px;

  .admin {
    color: #eb4144 !important;
  }

  p {
    color: var(--text-color);
    font-size: 1.2rem;
  }

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .view-profil {
    color: var(--primary-1);
    cursor: pointer;
    outline: none;
    border: 1px solid var(--primary-1);
    background-color: var(--primary-4);
    border-radius: 4px;
    padding: 5px 12px;

    &:hover {
      color: var(--primary-4);
      background-color: var(--primary-1);
    }
  }

  .online {
    position: absolute;
    bottom: 3px;
    left: 32px;
    background-color: green;
    height: 17px;
    width: 17px;
    border-radius: 100%;
    border: 3px solid var(--primary-3);
  }

  .offline {
    position: absolute;
    bottom: 3px;
    left: 32px;
    background-color: #6d6d6d;
    height: 17px;
    width: 17px;
    border-radius: 100%;
    border: 3px solid var(--primary-3);
  }
}
</style>
