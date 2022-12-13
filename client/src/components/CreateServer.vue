<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import type { Namespace } from "@/shared/interfaces/Namespace";
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { generateInviteCode } from "@/utils/generateInviteCode";
import { useSocket } from "@/shared/stores/socketStore";

const socketStore = useSocket();

const props = defineProps<{
  namespaceImage: File | undefined;
}>();

function createNamespace(formValue: Namespace) {
  socketStore.isNamespaceCreated = false;
  socketStore.ioClient?.emit("createNamespace", {
    name: formValue.name,
    inviteCode: generateInviteCode(),
    imgName: props.namespaceImage?.name,
    imgUrl: props.namespaceImage,
  });
}

const validationSchema = toFormValidator(
  z.object({
    name: z
      .string({ required_error: "Tu n'as rien saisi : (" })
      .trim()
      .min(2, "2 caractère minimum : (")
      .max(30, "30 caractères maximum : ("),
  })
);

const { handleSubmit, setErrors } = useForm<Namespace>({
  validationSchema,
});

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

      <button class="mb-20">C'est partie !</button>
      <!--              <div-->
      <!--                class="d-flex align-items-center justify-content-center"-->
      <!--                v-else-->
      <!--              >-->
      <!--                <spinner />-->
      <!--              </div>-->
    </div>
  </form>
</template>

<style lang="scss" scoped></style>
