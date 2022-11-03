<script setup lang="ts">
import { useSocket } from "@/shared/stores/socketStore";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { Message } from "@/shared/interfaces/Message";

const socketStore = useSocket();

const validationSchema = toFormValidator(
  z.object({
    data: z.string().max(500).optional(),
  })
);

const { handleSubmit, setErrors } = useForm<Message>({
  validationSchema,
});

const submit = handleSubmit((formValue: Message) => {
  console.log(formValue);
  try {
    socketStore.activeNsSocket.emit("message", {
      text: formValue.data,
      roomId: socketStore.activeRoom?.id,
    });
  } catch (e: string | any) {
    setErrors({
      data: e.data,
    });
  }
});

const { value: dataValue, errorMessage: dataError } = useField("data");
</script>

<template>
  <div class="chat-container d-flex flex-column flex-fill">
    <div class="message-container">
      <template v-for="message of socketStore.messages">
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

    <form @submit.prevent class="form-message">
      <div>
        <input
          @keyup.enter="submit"
          v-model="dataValue"
          type="text"
          placeholder="Envoyer un message"
        />
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  justify-content: end;
  padding: 0 0 30px 30px;

  .message-container {
    display: flex;
    flex-direction: column-reverse;
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
    color: white;
    font-weight: 500;
    font-size: 1.1rem;
  }

  .message {
    width: 99%;
    gap: 10px;
    color: white;
    margin-top: 20px;

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

  .form-message {
    margin-top: 20px;

    div {
      padding-right: 30px;
    }

    input {
      min-width: 100%;
      border-radius: 3px;
      font-size: 1rem;
      height: 40px;
      outline: none;
      border: none;
      color: white;
      background-color: #40444b;
    }
  }
}
</style>
