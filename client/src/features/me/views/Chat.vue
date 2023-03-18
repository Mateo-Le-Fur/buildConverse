<script setup lang="ts">
import SendMessage from "@/features/me/components/chat/SendMessage.vue";
import { useMe } from "@/features/me/stores/meStore";

import { nextTick, onBeforeUnmount, watch, watchEffect } from "vue";
import { useChat } from "@/shared/stores/chatStore";
import { useSocket } from "@/shared/stores/socketStore";
import { usePrivateMessage } from "@/features/me/stores/privateMessageStore";
import { useRoute } from "vue-router";
import FriendInfo from "@/features/me/components/friend/FriendInfo.vue";
import { getUserAvatar } from "@/utils/getUserAvatar";

const meStore = useMe();
const socketStore = useSocket();
const privateMessageStore = usePrivateMessage();
const chatStore = useChat();
const route = useRoute();

const avatarURL = import.meta.env.VITE_AVATAR;

watch(
  [() => route.params.privateRoomId, () => meStore.recipients],
  ([privateRoomId, recipients]) => {
    if (privateRoomId && recipients) {
      privateMessageStore.isBeginningConversation = false;
      privateMessageStore.messages = [];
      meStore.getCurrentConversation(Number(privateRoomId));
    }
  },
  { immediate: true }
);

watchEffect(async () => {
  if (privateMessageStore.isMessagesLoaded) {
    await nextTick();
    chatStore.init(document.querySelector(".message-container"));
    chatStore.scrollToBottomOnMounted();
  }
});

watch(
  () => privateMessageStore.isMessagePushInArray,
  async (value) => {
    if (value) {
      await nextTick();
      chatStore.scrollToBottom();
      privateMessageStore.isMessagePushInArray = false;
    }
  }
);

onBeforeUnmount(() => {
  privateMessageStore.$reset();
  chatStore.$reset();
});
</script>
<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <div class="d-flex flex-column flex-fill justify-content-end overflow-auto">
      <div
        @scroll="
          chatStore.loadMoreMessages(
            $event,
            {
              socket: socketStore.ioClient,
              eventName: 'loadMorePrivateMessages',
            },
            privateMessageStore.messages.length,
            meStore.currentRecipient?.privateRoomId
          )
        "
        class="message-container"
      >
        <h2
          v-if="privateMessageStore.isBeginningConversation"
          class="room-name"
        >
          Ceci est le début de la conversation avec
          {{ meStore.currentRecipient?.pseudo }}
        </h2>
        <template
          v-for="message of chatStore.filteredMessages(
            privateMessageStore.messages
          )"
          :key="message.id"
        >
          <div v-if="message.separator" class="separator">
            <span>{{
              new Date(message.created_at).toLocaleDateString("fr-FR")
            }}</span>
          </div>
          <div
            v-if="message.avatarAuthor"
            class="d-flex message"
            :data-id="message.id"
          >
            <div>
              <img
                :src="getUserAvatar(message.userId)"
                :alt="message.authorName"
              />
            </div>
            <div class="d-flex flex-column w-100">
              <div class="d-flex align-items-center mb-5">
                <p class="author">
                  {{ message.authorName
                  }}<span v-if="message.id !== -1">{{
                    new Date(message.created_at).toLocaleString("fr-FR")
                  }}</span>
                </p>
              </div>
              <div class="d-flex w-100">
                <p class="message-color" :class="{ red: message.id === -1 }">
                  {{ message.data }}
                </p>
              </div>
            </div>
          </div>
          <div
            v-else
            class="d-flex message"
            :class="{ groupMessage: !message.avatarAuthor }"
            :data-id="message.id"
          >
            <div class="d-flex w-100">
              <p
                class="message-color"
                :class="{
                  red: message.id === -1,
                  indent: !message.avatarAuthor,
                }"
              >
                {{ message.data }}
              </p>
            </div>
          </div>
        </template>
      </div>
      <SendMessage />
    </div>
  </div>
  <FriendInfo />
</template>

<style scoped lang="scss">
@import "@/assets/chat.scss";
</style>
