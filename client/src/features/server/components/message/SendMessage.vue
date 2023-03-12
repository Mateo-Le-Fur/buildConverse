<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { MessageInterface } from "@/shared/interfaces/MessageInterface";
import { useSocket } from "@/shared/stores/socketStore";
import { useRoom } from "@/features/server/stores/roomStore";
import { useUser } from "@/shared/stores";
import { onMounted, ref, watch } from "vue";

const socketStore = useSocket();
const roomStore = useRoom();
const userStore = useUser();

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
    socketStore.ioClient?.emit(
      "message",
      {
        data: formValue.data,
        roomId: roomStore.activeRoom?.id,
        avatar: userStore.currentUser?.avatarUrl,
      },
      (response: { status: string; message: string }) => {
        console.log(response);
      }
    );

    resetForm();
  } catch (e: any) {
    console.error(e);
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
        ref="inputElem"
        v-focus
        v-model="dataValue"
        type="text"
        :placeholder="`Envoyer un message dans ${roomStore.activeRoom?.name}`"
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
    height: 45px;
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
