<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/me/stores/meStore";

const socketStore = useSocket();
const meStore = useMe();

defineProps<{
  friendsId: number;
}>();

function declineFriendRequest(senderId: number) {
  socketStore.ioClient?.emit("declineFriendRequest", senderId);
}

function acceptFriendRequest(senderId: number) {
  socketStore.ioClient?.emit(
    "acceptFriendRequest",
    senderId,
    (response: { status: string; message: string }) => {
      if (response.status === "ok") {
      }
    }
  );
}
</script>

<template>
  <div class="d-flex flex-fill justify-content-end g-10">
    <svg
      class="accept"
      @click.stop="acceptFriendRequest(friendsId)"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
      <path
        d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
      />
    </svg>
    <svg
      class="decline"
      @click.stop="declineFriendRequest(friendsId)"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
    >
      <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
      <path
        d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256S114.6 512 256 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
      />
    </svg>
  </div>
</template>

<style scoped lang="scss">
svg {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: white;

  &:hover {
    border: 1px solid var(--primary-4);
  }
}

.accept {
  fill: #2ecc71;
}

.decline {
  fill: #eb4144;
}
</style>
