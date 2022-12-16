<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { Message } from "@/shared/interfaces/Message";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/home/stores/meStore";
import { useUser } from "@/shared/stores";
import type { UnwrapRef } from "vue";
import type { User } from "@/shared/interfaces/User";

const socketStore = useSocket();
const userStore = useUser();
const meStore = useMe();


const validationSchema = toFormValidator(
  z.object({
    data: z.string().max(500).optional()
  })
);

const { handleSubmit, setErrors } = useForm<Message>({
  validationSchema
});

const { value: dataValue, errorMessage: dataError } = useField("data");

const submit = handleSubmit((formValue: Message) => {
  try {
    // sendPrivateMessage
    socketStore.ioClient?.emit("sendPrivateMessage", {
      privateRoomId: meStore.currentRecipient?.privateRoomId,
      recipientId: meStore.currentRecipient?.id,
      data: formValue.data
    });
    dataValue.value = null;
  } catch (e: any) {
    setErrors({
      data: e.data
    });
  }
});

function resetField(e: Event) {
  const target = e.target as HTMLInputElement;
  target.value = "";
}
</script>

<template>
  <form @submit.prevent="submit" class="form-message">
    <div>
      <input
        @keyup.enter="resetField($event)"
        v-model="dataValue"
        type="text"
        :placeholder="`Envoyer un message à ${meStore.currentRecipient?.pseudo}`"
      />
    </div>
  </form>
</template>

<style scoped lang="scss">
.form-message {
  margin-top: 20px;
  padding: 0 20px 20px 20px;

  input {
    min-width: 0;
    width: 100%;
    border-radius: 8px;
    font-size: 1rem;
    height: 40px;
    outline: none;
    border: none;
    background-color: #40444b;
  }
}
</style>
