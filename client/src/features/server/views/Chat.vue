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
  chatStore.$reset();
});
</script>

<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <div
      @scroll="
        chatStore.loadMoreMessages(
          $event,
          {
            socket: socketStore.activeNsSocket,
            eventName: 'loadMoreMessages',
          },
          messageStore.messages.length,
          roomStore.activeRoom?.id,
          roomStore.activeRoom?.namespaceId
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
            <img
              class="mr-10"
              :src="message.avatarAuthor"
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
  width: 0;
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
