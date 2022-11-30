<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { Message } from "@/shared/interfaces/Message";
import { useSocket } from "@/shared/stores/socketStore";
import { useRoom } from "@/features/server/stores/roomStore";

const socketStore = useSocket();
const roomStore = useRoom();

const validationSchema = toFormValidator(
  z.object({
    data: z.string().max(500).optional(),
  })
);

const { handleSubmit, setErrors } = useForm<Message>({
  validationSchema,
});

const { value: dataValue, errorMessage: dataError } = useField("data");

const submit = handleSubmit((formValue: Message) => {
  try {
    socketStore.activeNsSocket.emit("message", {
      text: formValue.data,
      roomId: roomStore.activeRoom?.id,
    });

    dataValue.value = null;
  } catch (e: string | any) {
    setErrors({
      data: e.data,
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
        placeholder="Envoyer un message"
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
    border-radius: 3px;
    font-size: 1rem;
    height: 40px;
    outline: none;
    border: none;
    background-color: #40444b;
  }
}
</style>
