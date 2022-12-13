<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { Namespace } from "@/shared/interfaces/Namespace";
import { useSocket } from "@/shared/stores/socketStore";

const socketStore = useSocket();

function joinNamespace(formValue: Namespace) {
  socketStore.isNamespaceCreated = false;
  socketStore.ioClient?.emit(
    "userJoinNamespace",
    {
      inviteCode: formValue.inviteCode,
    },
    (response: { message: string; status: string }) => {
      if (response.status !== "ok") {
        setErrors({
          inviteCode: response.message,
        });
      }
    }
  );
}

const validationSchema = toFormValidator(
  z.object({
    inviteCode: z
      .string({ required_error: "Tu n'as rien saisi : (" })
      .length(8, "Le code est composé de 8 caractères"),
  })
);

const { handleSubmit, setErrors } = useForm<Namespace>({
  validationSchema,
});

const submitInviteCode = handleSubmit((formValue: Namespace, actions) => {
  try {
    joinNamespace(formValue);
    actions.resetForm();
  } catch (e: any) {
    setErrors({
      inviteCode: e.message,
    });
  }
});

const { value: inviteCodeValue, errorMessage: inviteCodeError } = useField(
  "inviteCode",
  {},
  { validateOnValueUpdate: false }
);
</script>

<template>
  <form @submit.prevent.stop="submitInviteCode">
    <div class="d-flex flex-column">
      <p>Tu as un code d'invitation ?</p>
      <input
        class="mb-5"
        id="inviteCode"
        type="text"
        placeholder="Entre le code"
        v-model="inviteCodeValue"
      />
      <p class="form-error" v-if="inviteCodeError">
        {{ inviteCodeError }}
      </p>
      <button>Rejoindre un serveur</button>
    </div>
  </form>
</template>

<style lang="scss" scoped></style>
