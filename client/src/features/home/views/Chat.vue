<script setup lang="ts">
import SendMessage from "@/features/home/components/SendMessage.vue";
import { useMe } from "@/features/home/stores/meStore";
import ChatTopBar from "@/features/home/components/ChatTopBar.vue";
import { nextTick, onMounted, onUnmounted, onUpdated, ref, watch } from "vue";
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

onUnmounted(() => {
  chatStore.$reset();
});
</script>

<template>
  <div class="d-flex flex-column flex-fill overflow-auto">
    <ChatTopBar />
    <div class="chat-container d-flex flex-column flex-fill">
      <div
        @scroll="
          chatStore.loadMoreMessages(
            $event,
            'loadMorePrivateMessages',
            meStore.messages.length,
            meStore.currentRecipient?.privateRoomId
          )
        "
        v-if="meStore.isMessagesLoaded"
        class="message-container"
      >
        <h2 v-if="meStore.isBeginningConversation" class="room-name">
          Ceci est le début de la conversation avec
          {{ meStore.currentRecipient?.pseudo }}
        </h2>
        <div
          v-for="message of chatStore.filteredMessages(meStore.messages)"
          :key="message.id"
          class="d-flex message"
          :class="{ groupMessage: !message.avatarAuthor }"
        >
          <div class="d-flex g-15">
            <div class="avatar" v-if="message.avatarAuthor">
              <img
                :src="message.avatarAuthor"
                alt="user avatar"
                class="mr-10"
              />
            </div>
            <div class="d-flex flex-column w-100">
              <div
                v-if="message.avatarAuthor"
                class="d-flex align-items-center mb-5"
              >
                <p class="author">
                  {{ message.authorName }}
                  <span>{{
                    new Date(message.created_at).toLocaleString("fr-FR")
                  }}</span>
                </p>
              </div>
              <div class="d-flex w-100">
                <p
                  :class="{ indent: !message.avatarAuthor }"
                  class="message-color"
                >
                  {{ message.data }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SendMessage @scroll-to-bottom="chatStore.scrollToBottom()" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  justify-content: end;
  overflow-y: auto;

  .room-name {
    padding: 10px 20px 10px 20px;
  }

  .message-container {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .message-container::-webkit-scrollbar {
    width: 10px;
  }

  .message-container::-webkit-scrollbar-track {
    box-shadow: inset 0 0 10px 10px var(--primary-2);
    border: solid 2px transparent;
    border-radius: 10px;
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

    .avatar {
      width: 40px;
      height: 40px;
      img {
        width: 40px;
        min-width: 40px;
        height: 40px;
        min-height: 40px;
        border-radius: 50%;
      }
    }

    .message-color {
      color: #edeaea;
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
  padding-left: 55px;
}

.groupMessage {
  margin-top: 0 !important;
}
</style>
