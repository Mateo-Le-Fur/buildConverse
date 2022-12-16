<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import SendMessage from "@/features/home/components/SendMessage.vue";
import { useMe } from "@/features/home/stores/meStore";
import ChatTopBar from "@/features/home/components/ChatTopBar.vue";
import { useUser } from "@/shared/stores";
import { ref, watch } from "vue";
import type { Message } from "@/shared/interfaces/Message";

const meStore = useMe();
const userStore = useUser();


</script>

<template>
  <div class="d-flex flex-column flex-fill overflow-auto">
    <ChatTopBar />
    <div class="chat-container d-flex flex-column flex-fill">
      <div class="message-container">
        <h2 class="room-name">
          Ceci est le début de la conversation avec
          {{ meStore.currentRecipient?.pseudo }}
        </h2>
        <div
          v-for="message of meStore.getFilteredMessages()"
          :key="message.id"
          class="d-flex message"
          :class="{ groupMessage: !message.avatarAuthor }"
        >
          <div class="d-flex g-15">
            <div v-if="message.avatarAuthor">
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
      <SendMessage />
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
  padding-left: 55px;
}

.groupMessage {
  margin-top: 0 !important;
}
</style>
