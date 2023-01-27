<script setup lang="ts">
import FriendListTopBar from "@/features/home/components/FriendListTopBar.vue";
import { ref, watch, watchEffect } from "vue";
import { useMe } from "@/features/home/stores/meStore";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import AddFriend from "@/features/home/components/AddFriend.vue";
import { useSocket } from "@/shared/stores/socketStore";
import DeleteFriend from "@/features/home/components/DeleteFriend.vue";
import PendingFriendRequest from "@/features/home/components/PendingFriendRequest.vue";

const addFriend = ref<boolean>(false);
const confirmDelete = ref<boolean>(false);
const idToDelete = ref<number | null>(null);
const selectedItem = ref<string>("online");

const socketStore = useSocket();
const meStore = useMe();

const filter = ref<FriendsInterface[] | null | undefined>(
  meStore.friends?.filter((friend) => friend.status === selectedItem.value)
);

function setItem(status: string) {
  selectedItem.value = status;
}

function setAddFriend(value: boolean) {
  addFriend.value = value;
}

watchEffect(() => {
  switch (selectedItem.value) {
    case "online":
      filterFriends("online");
      break;
    case "all":
      filterFriends("all");
      break;
    case "pending":
      filterFriends("pending");
      break;
    case "add":
      filterFriends("add");
      break;
  }
});

function filterFriends(status: string) {
  if (status === "all") {
    filter.value = meStore.friends;
    return;
  }
  filter.value = meStore.friends?.filter((friend) => friend.status === status);
}

function getConversationWithAFriend(friendId: number) {
  const foundConversation = meStore.recipients.find(
    (conversation) => conversation.id === friendId
  );

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
  <FriendListTopBar
    :add-friend="addFriend"
    @add-friend="setAddFriend"
    @filter-friends="filterFriends"
    @selected-item="setItem"
  />
  <template v-if="!addFriend">
    <div class="friends-container d-flex flex-column p-30">
      <div
        @click="getConversationWithAFriend(friend.id)"
        class="friends d-flex align-items-center justify-content-space-between"
        v-for="friend of filter"
        :key="friend.id"
      >
        <div class="d-flex align-items-center g-10">
          <div class="img-container d-flex align-items-center">
            <img :src="friend.avatarUrl" alt="user avatar" />
            <div
              :class="{
                online: friend.status === 'online',
                offline: friend.status === 'offline',
              }"
            ></div>
          </div>
          <div>
            <p class="pseudo">{{ friend.pseudo }}</p>
          </div>
        </div>
        <div
          v-if="friend.status !== 'pending'"
          class="d-flex align-items-center g-10"
        >
          <div
            class="d-flex align-items-center justify-content-center svg-icon"
          >
            <svg
              class="chat"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
              <path
                d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64h96v80c0 6.1 3.4 11.6 8.8 14.3s11.9 2.1 16.8-1.5L309.3 416H448c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64z"
              />
            </svg>
          </div>
          <div
            @click.stop="(confirmDelete = true), (idToDelete = friend.id)"
            class="d-flex align-items-center justify-content-center svg-icon"
          >
            <svg
              class="delete"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 512"
            >
              <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
              <path
                d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM472 200H616c13.3 0 24 10.7 24 24s-10.7 24-24 24H472c-13.3 0-24-10.7-24-24s10.7-24 24-24z"
              />
            </svg>
          </div>
        </div>
        <PendingFriendRequest
          v-if="friend.status === 'pending'"
          :friends-id="friend.id"
        />
      </div>
      <Teleport to="body">
        <DeleteFriend
          @delete-friend="deleteFriend(idToDelete)"
          @close-popup="confirmDelete = false"
          v-if="confirmDelete"
        />
      </Teleport>
    </div>
  </template>
  <AddFriend v-else />
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";
.friends-container {
  @include mixins.md {
    align-items: center;
  }

  .friends {
    cursor: pointer;
    width: 70%;
    border-top: 1px solid #4a4a55;
    padding: 12px;

    @include mixins.md {
      width: 95%;
    }

    &:hover {
      background-color: #4a4a55;
      border-radius: 5px;
    }

    .pseudo {
      font-size: 1.1rem;
    }

    .img-container {
      position: relative;
      width: 40px;
      height: 40px;

      img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
      }

      .online {
        position: absolute;
        bottom: 0;
        left: 25px;
        background-color: green;
        height: 17px;
        width: 17px;
        border-radius: 100%;
        border: 3px solid var(--primary-2);
      }

      .offline {
        position: absolute;
        bottom: 0;
        left: 25px;
        background-color: #6d6d6d;
        height: 17px;
        width: 17px;
        border-radius: 100%;
        border: 3px solid var(--primary-2);
      }
    }

    .accept {
      cursor: pointer;
    }

    .decline {
      cursor: pointer;
    }

    .svg-icon {
      cursor: pointer;
      background-color: var(--primary-2);
      border-radius: 50%;
      height: 35px;
      width: 35px;

      .chat {
        fill: #dddddd;
        height: 15px;
        width: 15px;
      }

      .delete {
        fill: #eb4144ff;
        height: 18px;
        width: 18px;
      }
    }
  }
}
</style>
