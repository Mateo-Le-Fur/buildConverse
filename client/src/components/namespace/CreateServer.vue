<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import type { Namespace } from "@/shared/interfaces/Namespace";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { generateInviteCode } from "@/utils/generateInviteCode";
import { useSocket } from "@/shared/stores/socketStore";
import Spinner from "@/components/loader/Spinner.vue";
import { ref } from "vue";
import { useNamespace } from "@/features/server/stores/namespaceStore";

const socketStore = useSocket();
const namespaceStore = useNamespace();
const error = ref<boolean>(false);

const props = defineProps<{
  namespaceImage: File | undefined;
}>();

const validationSchema = toFormValidator(
  z.object({
    name: z
      .string({ required_error: "Tu n'as rien saisi : (" })
      .trim()
      .min(2, "2 caractère minimum : (")
      .max(50, "50 caractères maximum : ("),
  })
);

const { handleSubmit, setErrors } = useForm<Namespace>({
  validationSchema,
});

function createNamespace(formValue: Namespace) {
  namespaceStore.creatingNamespace = true;
  socketStore.ioClient?.emit(
    "createNamespace",
    {
      name: formValue.name,
      inviteCode: generateInviteCode(),
      imgBuffer: props.namespaceImage,
    },
    (response: { status: string; message: string }) => {
      if (response.status !== "ok") {
        setErrors({
          name: response.message,
        });
      }
    }
  );
}

const submitNamespace = handleSubmit((formValue: Namespace) => {
  try {
    if (props.namespaceImage?.size! > 1e7) {
      throw new Error("10Mo Maximum pour la taille des images");
    }
    createNamespace(formValue);
  } catch (e: any) {
    setErrors({
      name: e.message,
    });
  }
});

const { value: nameValue, errorMessage: nameError } = useField(
  "name",
  {},
  {
    validateOnValueUpdate: false,
  }
);
</script>

<template>
  <form @submit.prevent.stop="submitNamespace">
    <div class="d-flex flex-column">
      <input
        class="mb-10"
        v-model="nameValue"
        id="name"
        type="text"
        placeholder="Nom du serveur"
      />
      <p class="form-error" v-if="nameError">{{ nameError }}</p>

      <div class="send-form d-flex flex-column mb-20">
        <button v-if="!namespaceStore.creatingNamespace">C'est partie !</button>
        <div v-else class="d-flex align-items-center justify-content-center">
          <Spinner />
        </div>
      </div>
    </div>
  </form>
</template>

<style lang="scss" scoped>
.send-form {
  background-color: #236cab;
  border-radius: 3px;
}
</style>
