<script setup lang="ts">
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import { getUserAvatar } from "@/utils/getUserAvatar";
import type { User } from "@/shared/interfaces/User";
import AddFriendButton from "@/components/friend/AddFriendButton.vue";

defineProps<{
  friend: User | FriendsInterface;
}>();
</script>

<template>
  <div class="show-friend d-flex align-items-center g-10">
    <div class="avatar d-flex align-items-center">
      <img :src="getUserAvatar(friend.id)" :alt="friend.pseudo" />
    </div>
    <span class="pseudo">
      {{ friend.pseudo }}
    </span>

    <AddFriendButton :component="'AddFriend'" :friend="friend" />
  </div>
</template>

<style lang="scss">
@use "@/assets/mixins.scss";

.show-friend {
  padding: 12px 15px;
  border-radius: 10px;

  .avatar {
    img {
      width: 40px;
      height: 40px;
    }
  }

  &:hover {
    background-color: var(--primary-1);

    .pseudo {
      color: var(--text-color-white);
      font-weight: 500;
    }

    .send-request {
      color: var(--text-color-white);
      border: 1px solid var(--primary-4);
      background-color: var(--primary-1);
    }
  }
}

.pseudo {
  color: var(--text-color);
  font-weight: 500;
}

.send-request {
  outline: none;
  cursor: pointer;
  color: var(--primary-1);
  background-color: var(--primary-3);
  font-weight: 500;
  padding: 5px;
  border-radius: 5px;
  font-size: 0.8rem;
  border: 1px solid var(--primary-1);

  &:hover {
    color: var(--primary-2) !important;
    background: var(--primary-4) !important;
  }
}

@media (max-width: 800px) {
  input {
    width: 100%;
  }
}
</style>
