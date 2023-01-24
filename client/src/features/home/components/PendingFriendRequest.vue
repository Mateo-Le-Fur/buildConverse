<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/home/stores/meStore";

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
  <div class="d-flex g-10">
    <button
      @click.stop="acceptFriendRequest(friendsId)"
      class="btn btn-success accept"
    >
      Accepter
    </button>
    <button
      @click.stop="declineFriendRequest(friendsId)"
      class="btn btn-danger decline"
    >
      Refuser
    </button>
  </div>
</template>

<style scoped lang="scss"></style>
