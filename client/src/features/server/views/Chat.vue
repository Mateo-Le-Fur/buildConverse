<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import SendMessage from "../components/SendMessage.vue";
import { onMounted, onUnmounted, onUpdated, ref, watchEffect } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import type { RouteParams } from "vue-router";
import botAvatar from "@/assets/images/bot.png";


function scrollToBottom() {
  const element = ref<HTMLDivElement | null>(null);
  element.value = document.querySelector(".message-container");

  element.value?.scrollTo({
    top: element.value?.scrollHeight,
    left: 0
  });
}

onMounted(() => {
  scrollToBottom();
});

onUpdated(() => {
  scrollToBottom();
});

const socketStore = useSocket();
const roomStore = useRoom();

const props = defineProps<{
  params: RouteParams;
}>();
</script>

<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <div class="message-container">
      <h2 class="room-name">
        Bienvenue dans le salon {{ roomStore.activeRoom?.name }}
      </h2>
      <template v-for="message of socketStore.messages" :key="message.id">
        <div class="d-flex message">
          <div>
            <img class="mr-10" :src="message.avatarAuthor ?? botAvatar" />
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
      </template>
    </div>
    <SendMessage />
  </div>
</template>

<style scoped lang="scss">
.scroller {
  height: 100%;
}

.chat-container {
  justify-content: end;
  width: 0;

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

    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
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
</style>
