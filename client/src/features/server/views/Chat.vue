<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import SendMessage from "../components/SendMessage.vue";
import { onMounted, onUpdated, ref } from "vue";
import { useRoom } from "@/features/server/stores/roomStore";
import type { RouteParams } from "vue-router";
import { useUser } from "@/shared/stores";

const userStore = useUser();

function scrollToBottom() {
  const element = ref<HTMLDivElement | null>(null);
  element.value = document.querySelector(".message-container");

  element.value?.scrollTo({
    top: element.value?.scrollHeight,
    left: 0,
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

defineProps<{
  params: RouteParams;
}>();
</script>

<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <div
      v-if="socketStore.isMessagesLoaded && roomStore.activeRoom"
      class="message-container"
    >
      <h2 class="room-name">
        Bienvenue dans le salon {{ roomStore.activeRoom?.name }}
      </h2>
      <template
        v-for="message of socketStore.getFilteredMessages()"
        :key="message.id"
      >
        <div v-if="message.avatarAuthor" class="d-flex message">
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

.indent {
  padding-left: 58px;
}

.groupMessage {
  margin-top: 0 !important;
}
</style>
