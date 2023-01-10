<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { Namespace } from "@/shared/interfaces/Namespace";
import { useSocket } from "@/shared/stores/socketStore";
import type { RouteParams } from "vue-router";

const props = defineProps<{
  createRoomPopup: boolean;
  params: RouteParams;
}>();

const emit = defineEmits<{
  (e: "roomPopup", data: boolean): void;
}>();

const socketStore = useSocket();

const validationSchema = toFormValidator(
  z.object({
    name: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .max(30, "30 caractères maximum : ("),
  })
);

const { handleSubmit, setErrors } = useForm<Namespace>({
  validationSchema,
});

const submit = handleSubmit((formValue: Namespace) => {
  try {
    socketStore.activeNsSocket.emit(
      "createRoom",
      {
        name: formValue.name,
        namespaceId: props.params.idChannel,
      },
      (response: { status: string; message: string }) => {
        if (response.status !== "ok") {
          socketStore.setError(response.message);
        } else {
          emit("roomPopup", false);
        }
      }
    );
  } catch (e: string | any) {
    setErrors({
      name: e.message,
    });
  }
});

const { value: nameValue, errorMessage: nameError } = useField("name");
</script>

<template>
  <div>
    <Teleport to="body">
      <div @click="emit('roomPopup', false)" class="calc"></div>
    </Teleport>
    <div class="d-flex align-items-center flex-column add-room">
      <h2>Créer un salon</h2>
      <form class="d-flex flex-column" @submit.prevent="submit">
        <div>
          <span>#</span>
          <input
            v-focus
            v-model="nameValue"
            type="text"
            placeholder="Nom du salon"
          />
        </div>
        <span class="form-error" v-if="nameError">{{ nameError }}</span>
        <span class="form-error" v-if="socketStore.error">{{
          socketStore.error
        }}</span>
        <button>Créer</button>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.add-room {
  position: fixed;
  gap: 15px;
  background-color: var(--primary-3);
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  padding: 15px;
  border-radius: 10px;
  z-index: 10;

  form {
    gap: 10px;
  }

  div {
    background-color: var(--primary-2);
    border-radius: 4px;
    padding: 3px 0 3px 8px;

    span {
      font-size: 1.1rem;
      color: #f4f4f4;
    }
  }

  input {
    outline: none;
    border: none;
    color: #edeaea;
    background-color: var(--primary-2);

    a::placeholder {
      background-color: #edeaea;
    }
  }

  button {
    cursor: pointer;
    width: 60%;
    margin: auto;
    height: 30px;
    outline: none;
    border: none;
    border-radius: 4px;
    background-color: #236cab;
  }
}
</style>
