<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import SendMessage from "../components/SendMessage.vue";
import { onUpdated, ref } from "vue";

onUpdated(() => {
  const element = ref<HTMLDivElement | null>(
    document.querySelector(".message-container")
  );

  if (element.value?.scrollHeight !== 0) {
    element.value?.scrollTo({
      top: element.value?.scrollHeight,
      left: 0,
    });
  }
});

const socketStore = useSocket();
</script>

<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <div class="message-container">
      <template v-for="message of socketStore.messages" :key="message.id">
        <div class="d-flex message">
          <div>
            <img
              class="mr-10"
              src="https://images.unsplash.com/photo-1666712867915-559da259e7ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60"
            />
          </div>
          <div class="d-flex flex-column w-100">
            <div class="d-flex align-items-center mb-5">
              <p class="author">
                {{ message.author_name
                }}<span>{{
                  new Date(message.created_at).toLocaleString("fr-FR")
                }}</span>
              </p>
            </div>
            <div class="d-flex w-100">
              <p class="message-color">{{ message.data }}</p>
            </div>
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
  min-width: 0;

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
    border: solid 3px transparent;
  }

  .message-container::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 10px 10px var(--primary-3);
    border: solid 3px transparent;
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
}
</style>
