<script setup lang="ts">
import SendMessage from "../components/message/SendMessage.vue";
import {
  nextTick,
  onBeforeUnmount,
  reactive,
  ref,
  watch,
  watchEffect,
} from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import { useChat } from "@/shared/stores/chatStore";
import { useMessage } from "@/features/server/stores/messageStore";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import { useSocket } from "@/shared/stores/socketStore";
import ChatTopBar from "@/features/server/components/topBar/ChatTopBar.vue";

const chatStore = useChat();
const roomStore = useRoom();
const socketStore = useSocket();
const messageStore = useMessage();

const state = reactive<{
  messages: MessageInterface[];
}>({
  messages: [],
});

watchEffect(async () => {
  if (messageStore.isMessagesLoaded) {
    await nextTick();
    chatStore.init(document.querySelector(".message-container"));
    chatStore.scrollToBottomOnMounted();
  }
});
watch(
  () => messageStore.isMessagePushInArray,
  async (value) => {
    if (value && chatStore.page <= 1) {
      await nextTick();
      chatStore.scrollToBottom();
    }
    messageStore.isMessagePushInArray = false;
  }
);

watchEffect(() => {
  state.messages = chatStore.filteredMessages(messageStore.messages);
});

onBeforeUnmount(() => {
  messageStore.$reset();
  chatStore.$reset();
});
</script>

<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <ChatTopBar />
    <div class="d-flex flex-column flex-fill justify-content-end overflow-auto">
      <div
        @scroll="
          chatStore.loadMoreMessages(
            $event,
            {
              socket: socketStore.ioClient,
              eventName: 'loadMoreMessages',
            },
            messageStore.messages.length,
            roomStore.activeRoom?.id
          )
        "
        class="message-container"
      >
        <h2 v-if="messageStore.isBeginningConversation" class="room-name">
          Bienvenue dans le salon {{ roomStore.activeRoom?.name }}
        </h2>
        <template v-for="message of state.messages" :key="message.id">
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
              <img :src="message.avatarAuthor" :alt="message.authorName" />
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
</template>

<style scoped lang="scss">
@import "@/assets/chat.scss";
</style>
