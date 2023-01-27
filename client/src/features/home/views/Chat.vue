<script setup lang="ts">
import SendMessage from "@/features/home/components/message/SendMessage.vue";
import { useMe } from "@/features/home/stores/meStore";
import ChatTopBar from "@/features/home/components/chat/ChatTopBar.vue";
import {
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  onUpdated,
  ref,
  watch,
} from "vue";
import { useChat } from "@/shared/stores/chatStore";

const meStore = useMe();
const chatStore = useChat();

const isMounted = ref<boolean>(false);

watch(
  () => meStore.isMessagesLoaded,
  async () => {
    await nextTick();
    chatStore.init(document.querySelector(".message-container"));
    chatStore.scrollToBottomOnMounted();
  },
  {
    immediate: true,
  }
);

watch(
  () => meStore.isMessagePushInArray,
  async (value) => {
    if (value) {
      await nextTick();
      chatStore.scrollToBottom();
      meStore.isMessagePushInArray = false;
    }
  }
);

watch(
  () => meStore.isMoreMessagesLoaded,
  async (value) => {
    if (value) {
      await nextTick();
      chatStore.newMessagesLoaded();
      meStore.isMoreMessagesLoaded = false;
    }
  }
);
</script>
<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <div
      @scroll="
        chatStore.loadMoreMessages(
          $event,
          'loadMoreMessages',
          meStore.messages.length,
          meStore.currentRecipient?.privateRoomId
        )
      "
      class="message-container"
    >
      <h2 v-if="meStore.isBeginningConversation" class="room-name">
        Ceci est le début de la conversation avec
        {{ meStore.currentRecipient?.pseudo }}
      </h2>
      <template
        v-for="message of chatStore.filteredMessages(meStore.messages)"
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
            <img class="mr-10" :src="message.avatarAuthor" />
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
              :class="{ red: message.id === -1, indent: !message.avatarAuthor }"
            >
              {{ message.data }}
            </p>
          </div>
        </div>
      </template>
    </div>
    <SendMessage />
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  justify-content: end;

  .room-name {
    padding: 10px 20px 10px 20px;
  }

  .message-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .separator {
    margin: 0.5rem 1rem 0 1rem;
    position: relative;
    text-align: center;
    border-bottom: 1px solid #4a4a55;

    span {
      font-size: 0.8rem;
      color: #bbb;
      background: var(--primary-1);
      z-index: 1;
      padding: 0 0.6rem;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .message-container::-webkit-scrollbar {
    width: 12px;
  }

  .message-container::-webkit-scrollbar-track {
    box-shadow: inset 0 0 12px 12px var(--primary-2);
    border: solid 2px transparent;
    border-radius: 12px;
  }

  .message-container::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 10px 10px var(--primary-3);
    border: solid 2px transparent;
    border-radius: 10px;
  }

  .author {
    font-weight: 500;
    font-size: 1.1rem;
  }

  .message {
    width: 99%;
    gap: 10px;
    margin-top: 20px;
    padding: 0 20px 10px 20px;

    &:hover {
      background-color: #32353bff;
    }

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .message-color {
      color: #d2d1d1;
    }

    p {
      word-break: break-all;
      margin: 0;
    }

    span {
      font-size: 0.8rem;
      margin-left: 10px;
      color: #bbb;
    }
  }

  .red {
    color: #eb4144 !important;
  }
}

.indent {
  padding-left: 58px;
}

.groupMessage {
  margin-top: 0 !important;
}
</style>
