<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useMe } from "@/features/me/stores/meStore";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import { useSocket } from "@/shared/stores/socketStore";
import DeleteFriendPopup from "@/features/me/components/friend/DeleteFriend.vue";
import PendingFriendRequest from "@/features/me/components/friend/PendingFriendRequest.vue";
import { getUserAvatar } from "@/utils/getUserAvatar";
import { usePage } from "@/shared/stores/pageStore";

const confirmDeletePopup = ref<boolean>(false);
const idToDelete = ref<number | null>(null);

const socketStore = useSocket();
const meStore = useMe();
const pageStore = usePage();

watchEffect(() => {
  if (meStore.friends.length) {
    filter();
  }
});

function filter() {
  meStore.friends.forEach((friend: FriendsInterface) => {
    switch (friend.status) {
      case "pending":
        friend.statusId = 0;
        break;
      case "online":
        friend.statusId = 1;
        break;
      case "offline":
        friend.statusId = 2;
        break;
    }
  });

  meStore.friends.sort((a, b) => a.statusId! - b.statusId!);
}

function getConversationWithAFriend(friendId: number) {
  const foundConversation = meStore.recipients.find(
    (conversation) => conversation.id === friendId
  );

  pageStore.navigate("Recipient");

  socketStore.ioClient?.emit("getConversationWithAFriend", {
    friendId,
    privateRoomId: foundConversation?.privateRoomId,
  });
}

function deleteFriend(friendId: number) {
  const checkIfConversationExist = meStore.recipients.find(
    (recipient) => recipient.id === friendId
  );

  socketStore.ioClient?.emit("deleteFriend", {
    friendId,
    privateRoomId: checkIfConversationExist?.privateRoomId,
  });
}
</script>
<template>
  <div
    class="friend-container d-flex flex-column"
    v-for="friend of meStore.friends"
    :key="friend.id"
    @click="getConversationWithAFriend(friend.id)"
  >
    <div class="friend d-flex align-items-center flex-fill g-10">
      <div class="avatar">
        <img :src="getUserAvatar(friend.id)" :alt="friend.pseudo" />
      </div>
      <div class="d-flex flex-column justify-content-center">
        <p class="pseudo">{{ friend.pseudo }}</p>
        <p class="status">
          {{
            friend.status === "online"
              ? "En ligne"
              : friend.status === "offline"
              ? "Hors ligne"
              : "En attente"
          }}
        </p>
      </div>
      <div
        v-if="friend.status !== 'pending'"
        class="delete-friend d-flex flex-fill justify-content-end"
      >
        <div
          @click.stop="(idToDelete = friend.id), (confirmDeletePopup = true)"
          class="delete-button d-flex align-items-center justify-content-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM472 200H616c13.3 0 24 10.7 24 24s-10.7 24-24 24H472c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
            />
          </svg>
        </div>
        <Teleport to="body">
          <DeleteFriendPopup
            @delete-friend="deleteFriend(idToDelete)"
            @close-popup="confirmDeletePopup = false"
            v-if="confirmDeletePopup"
          />
        </Teleport>
      </div>
      <PendingFriendRequest v-else :friends-id="friend.id" />
    </div>
    <div
      :class="{
        online: friend.status === 'online',
        offline: friend.status === 'offline',
      }"
    ></div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";
.friend-container {
  position: relative;
  border-radius: 10px;
  @include mixins.md {
    align-items: center;
  }
  &:hover {
    background-color: var(--primary-1);
    .pseudo {
      font-weight: 500;
      color: var(--primary-4);
    }
    .status {
      color: var(--primary-4);
    }
  }

  .pseudo {
    color: var(--text-color);
    font-weight: 500;
  }
  .status {
    color: var(--text-color);
  }

  .avatar {
    img {
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }
  }

  .friend {
    padding: 12px 15px;
    cursor: pointer;
    box-shadow: -1px 1px 2px 0 #a8a8a8;
    border-radius: inherit;
  }

  .delete-friend {
    .delete-button {
      padding: 5px;
      &:hover {
        border-radius: 50%;
        background-color: var(--primary-4);
      }
      svg {
        border-radius: 1px solid var(--primary-4);
        width: 18px;
        height: 18px;
        fill: var(--danger-1);
      }
    }
  }

  .online {
    position: absolute;
    bottom: 8px;
    left: 38px;
    background-color: green;
    height: 20px;
    width: 20px;
    border-radius: 100%;
    border: 3px solid var(--primary-4);
  }

  .offline {
    position: absolute;
    bottom: 8px;
    left: 38px;
    background-color: #6d6d6d;
    height: 20px;
    width: 20px;
    border-radius: 100%;
    border: 3px solid var(--primary-4);
  }
}
</style>
