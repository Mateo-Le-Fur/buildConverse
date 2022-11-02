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
        <div class="d-flex flex-column message">
          <div class="d-flex align-items-center">
            <img
              class="mr-10"
              src="https://images.unsplash.com/photo-1666712867915-559da259e7ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw0fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60"
            />
            <p>
              {{ message.author_name
              }}<span>{{
                new Date(message.created_at).toLocaleString("fr-FR")
              }}</span>
            </p>
          </div>
          <div>
            <p>{{ message.data }}</p>
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

  .message {
    width: 99%;
    gap: 6px;
    color: white;
    margin-top: 20px;

    img {
      width: 35px;
      height: 35px;
      border-radius: 50%;
    }

    p {
      word-break: break-all;
      margin: 0;
    }

    span {
      font-size: 0.9rem;
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
