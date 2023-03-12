<script setup lang="ts">
import { useMe } from "@/features/me/stores/meStore";
import { ref } from "vue";
import { router } from "@/routes";

const meStore = useMe();

const emit = defineEmits<{
  (e: "navigate", page: string): void;
}>();

const recipientHover = ref<boolean>(false);
const recipientId = ref<number | null>(null);

function onHover(id: number) {
  recipientId.value = id;
  recipientHover.value = true;
}

function onLeave() {
  recipientHover.value = false;
}

async function disableConversation(privateRoomId: number) {
  const { id } = await (
    await fetch(`/api/user/user/disable-channel/${privateRoomId}`, {
      method: "POST",
    })
  ).json();

  meStore.disableConversation(id);

  if (meStore.currentRecipient) {
    const nextFriend = meStore.getNextFriend(meStore.currentRecipient.id);

    if (!nextFriend) {
      emit("navigate", "FriendList");
      router.push("/channels/me");
      return;
    }

    meStore.currentRecipient = nextFriend;
    meStore.getConversationWithAFriend(meStore.currentRecipient);
  }
}
</script>

<template>
  <div class="private-message-container d-flex flex-column g-5">
    <div
      v-for="recipient of meStore.recipients.filter(
        (recipient) => recipient.active === true
      )"
      :class="{
        activeRecipient: recipient.privateRoomId === meStore.currentRecipientId,
      }"
      :key="recipient.id"
      class="private-message d-flex flex-column"
    >
      <router-link
        @mouseover="onHover(recipient.id)"
        @mouseleave="onLeave()"
        class="d-flex align-items-center g-10"
        :to="`/channels/me/${recipient.privateRoomId}`"
      >
        <div class="d-flex align-items-center flex-fill g-10">
          <div class="avatar">
            <img :src="recipient.avatarUrl" />
          </div>
          <div class="d-flex flex-column justify-content-center">
            <p class="pseudo">{{ recipient.pseudo }}</p>
            <p class="status">
              {{ recipient.status === "online" ? "En ligne" : "Hors ligne" }}
            </p>
          </div>
        </div>
        <div>
          <svg
            @click.stop.prevent="disableConversation(recipient.privateRoomId)"
            :class="{
              deleteButton:
                recipientHover === true && recipient.id === recipientId,
            }"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
            <path
              d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
            />
          </svg>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.private-message-container {
  .private-message {
    border-radius: 10px;
    padding: 12px 15px;
    box-shadow: -1px 1px 2px 0 #a8a8a8;

    &:hover {
      background-color: var(--primary-2);
      .pseudo {
        color: var(--primary-4);
        font-weight: 500;
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

    svg {
      display: none;
    }

    .deleteButton {
      display: block;
      width: 15px;
      height: 15px;
      fill: #dddddd;
    }
  }

  .avatar {
    width: 40px;
    height: 40px;

    img {
      border-radius: 50%;
      width: 40px;
      height: 40px;
    }
  }

  .activeRecipient {
    background-color: var(--primary-2);

    p {
      color: var(--primary-4) !important;
    }
  }
}
</style>
