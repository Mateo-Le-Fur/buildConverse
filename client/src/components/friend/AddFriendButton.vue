<script setup lang="ts">
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import { ref } from "vue";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/me/stores/meStore";
import { usePage } from "@/shared/stores/pageStore";

import type { User } from "@/shared/interfaces/User";
import { useUser } from "@/shared/stores";

const socketStore = useSocket();
const meStore = useMe();
const pageStore = usePage();
const userStore = useUser();

defineProps<{
  friend: User | FriendsInterface;
  component: String;
}>();

const isRequestSend = ref<boolean>(false);

function sendRequest(id: number) {
  if (meStore.friendRequestAlreadySent(id)) return;
  socketStore.ioClient?.emit(
    "friendRequest",
    {
      id,
    },
    (request: { status: string; message: string }) => {
      if (request.status !== "ok") {
      } else {
        meStore.pendingRequestsId.push({ id, status: "sent" });
        isRequestSend.value = true;
      }
    }
  );
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
</script>

<template>
  <div
    v-if="userStore.currentUser?.id !== friend.id"
    class="d-flex flex-fill align-items-center g-10"
    :style="
      component === 'Member'
        ? 'justify-content: flex-start;'
        : 'justify-content: flex-end;'
    "
  >
    <button
      v-if="
        !meStore.friendRequestAlreadySent(friend.id) &&
        !(friend.alreadyFriend || meStore.checkIfFriend(friend.id))
      "
      @click="sendRequest(friend.id)"
      class="send-request"
      :class="{ member: component === 'Member' }"
    >
      Ajouter un ami
    </button>
    <button
      v-else-if="
        meStore.friendRequestAlreadySent(friend.id) &&
        !meStore.checkIfFriend(friend.id)
      "
      @click="sendRequest(friend.id)"
      class="send-request"
      :class="{ member: component === 'Member' }"
    >
      Demande Envoyé
    </button>
    <button
      v-else-if="meStore.checkIfFriend(friend.id)"
      @click="getConversationWithAFriend(friend.id)"
      class="send-request"
      :class="{ member: component === 'Member' }"
    >
      Envoyer un message
    </button>
  </div>
</template>

<style scoped lang="scss">
.member {
  padding: 10px;
  &:hover {
    color: var(--text-color-white) !important;
    background-color: var(--primary-1) !important;
  }
}
</style>
