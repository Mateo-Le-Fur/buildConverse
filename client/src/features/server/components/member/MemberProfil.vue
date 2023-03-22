<script setup lang="ts">
import type { User } from "@/shared/interfaces/User";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import { getUserAvatar } from "@/utils/getUserAvatar";
import AddFriendButton from "@/components/friend/AddFriendButton.vue";

defineProps<{
  member: User | FriendsInterface;
}>();

const emit = defineEmits<{
  (e: "backToMemberList"): void;
}>();
</script>

<template>
  <div class="member-profil-container d-flex flex-column">
    <div class="member-profil d-flex flex-column">
      <svg
        @click="emit('backToMemberList')"
        class="back"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 512"
      >
        <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path
          d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
        />
      </svg>
      <div class="top-background"></div>
      <div class="avatar">
        <img :src="getUserAvatar(member.id)" :alt="member.pseudo" />
      </div>
      <div class="member-info">
        <p class="pseudo">{{ member.pseudo }}</p>
        <p class="member-since">
          Membre dans la communauté depuis le :
          {{
            new Date(member.UserHasNamespace.createdAt).toLocaleDateString(
              "fr-FR"
            )
          }}
        </p>
        <p class="member-description">{{ member.description }}</p>
        <AddFriendButton :component="'Member'" :friend="member" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.member-profil-container {
  --image-size: 100px;
  --top-background-size: 100px;
  position: absolute;
  width: 100%;
  z-index: 9997;
  background-color: var(--primary-4);
  .member-profil {
    position: relative;
    .back {
      width: 40px;
      height: 40px;
      cursor: pointer;
      top: 10px;
      right: 10px;
      position: absolute;
      fill: var(--primary-3);
    }

    .top-background {
      height: 100px;
      width: 100%;
      background-color: var(--primary-2);
    }

    .avatar {
      position: absolute;
      top: calc(var(--top-background-size) - var(--image-size) / 2);
      left: 50%;
      transform: translateX(-50%);
      border-radius: 50%;
      background-color: var(--primary-4);

      img {
        border: 2px solid var(--primary-4);
        border-radius: 50%;
        height: var(--image-size);
        width: var(--image-size);
      }
    }

    .member-info {
      padding: 10px 30px;
      .pseudo {
        margin-top: 40px;
        margin-bottom: 20px;
        text-align: center;
        font-size: 1.4rem;
      }

      .member-since {
        color: var(--text-color);
        margin-bottom: 15px;
      }

      .member-description {
        border: 1px solid var(--gray-2);
        border-radius: 8px;
        padding: 10px;
        color: var(--text-color);
        margin-bottom: 15px;
      }
    }
  }
}
</style>
