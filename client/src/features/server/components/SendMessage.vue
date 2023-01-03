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

const inputElem = ref<HTMLInputElement | null>(null);

const validationSchema = toFormValidator(
  z.object({
    data: z.string().max(500).optional(),
  })
);

const { handleSubmit, setErrors } = useForm<MessageInterface>({
  validationSchema,
});

const { value: dataValue, errorMessage: dataError } = useField("data");

const submit = handleSubmit((formValue: MessageInterface) => {
  try {
    socketStore.activeNsSocket.emit("message", {
      data: formValue.data,
      roomId: roomStore.activeRoom?.id,
      avatar: userStore.currentUser?.avatarUrl,
    });

    dataValue.value = null;
  } catch (e: any) {
    setErrors({
      data: e.data,
    });
  }
});

onMounted(() => {
  inputElem.value?.focus();
});

watch(
  () => roomStore.activeRoom,
  () => {
    dataValue.value = null;
    inputElem.value?.focus();
  }
);

function resetField(e: Event) {
  const target = e.target as HTMLInputElement;
  target.value = "";
}
</script>

<template>
  <form @submit.prevent="submit" class="form-message">
    <div>
      <input
        ref="inputElem"
        @keyup.enter="resetField($event)"
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
    height: 40px;
    outline: none;
    border: none;
    background-color: #40444b;
  }
}
</style>
