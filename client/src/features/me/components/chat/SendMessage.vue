<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/me/stores/meStore";
import { useUser } from "@/shared/stores";
import type { UnwrapRef } from "vue";
import type { User } from "@/shared/interfaces/User";

const socketStore = useSocket();
const userStore = useUser();
const meStore = useMe();

const emit = defineEmits<{
  (e: "scrollToBottom"): void;
}>();

const validationSchema = toFormValidator(
  z.object({
    data: z.string().trim().min(1).max(500),
  })
);

const { handleSubmit, setErrors, resetForm } = useForm<MessageInterface>({
  validationSchema,
});

const { value: dataValue, errorMessage: dataError } = useField("data");

const submit = handleSubmit((formValue: MessageInterface) => {
  try {
    socketStore.ioClient?.emit("sendPrivateMessage", {
      privateRoomId: meStore.currentRecipient?.privateRoomId,
      recipientId: meStore.currentRecipient?.id,
      data: formValue.data,
    });
    resetForm();
  } catch (e: any) {
    setErrors({
      data: e.data,
    });
  }
});
</script>

<template>
  <form @submit.prevent="submit" class="form-message">
    <div>
      <input
        v-focus
        v-model="dataValue"
        type="text"
        :placeholder="`Envoyer un message à ${
          meStore.currentRecipient?.pseudo ?? '...'
        }`"
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
    background-color: var(--primary-2);
    color: var(--primary-4);

    &::placeholder {
      color: var(--primary-4);
    }
  }
}
</style>
