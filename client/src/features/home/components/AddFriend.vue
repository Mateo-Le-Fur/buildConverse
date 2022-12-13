<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { User } from "@/shared/interfaces/User";
import { useSocket } from "@/shared/stores/socketStore";
import { ref } from "vue";

const socketStore = useSocket();

const isRequestSend = ref<boolean>(false);

const validationSchema = toFormValidator(
  z.object({
    pseudo: z.string({ required_error: "Le champ doit être remplie : (" }),
  })
);

const { handleSubmit, setErrors } = useForm<User>({
  validationSchema,
});

const submit = handleSubmit(async (formValue: User) => {
  try {
    socketStore.ioClient?.emit(
      "friendRequest",
      {
        pseudo: formValue.pseudo,
      },
      (request: { status: string; message: string }) => {
        if (request.status !== "ok") {
          setErrors({
            pseudo: request.message,
          });
        } else {
          isRequestSend.value = true;
        }
      }
    );
  } catch (e: string | any) {
    setErrors({});
  }
});

const { value: pseudoValue, errorMessage: pseudoError } = useField("pseudo");
</script>

<template>
  <div class="add-friend-container d-flex flex-column p-30">
    <div class="mb-20">
      <h4 class="mb-10">AJOUTER</h4>
      <p>Tu peux ajouter un ami grâce à son pseudo</p>
    </div>
    <div class="form-container d-flex align-items-center mb-10">
      <form @submit.prevent="submit" class="d-flex align-items-center">
        <div class="d-flex align-items-center justify-content-space-between">
          <input
            v-model="pseudoValue"
            type="text"
            placeholder="Entre un pseudo"
          />
          <button>Envoyer une demande d'ami</button>
        </div>
      </form>
    </div>
    <p class="form-error" v-if="pseudoError">{{ pseudoError }}</p>
    <p class="send-request-ok" v-if="isRequestSend">Demande d'ami envoyé</p>
  </div>
</template>

<style scoped lang="scss">
.add-friend-container {
  width: 70%;

  p {
    font-size: 0.8rem;
  }

  .form-container {
    min-height: 50px;
    background-color: var(--primary-3);
    border-radius: 8px;
    padding: 5px 15px 5px 0;

    form {
      width: 100%;

      div {
        width: inherit;

        input {
          border: none;
          outline: none;
          background-color: var(--primary-3);
          flex: 1 1 auto;
        }

        button {
          cursor: pointer;
          border: none;
          padding: 8px;
          background-color: #236cab;
          border-radius: 3px;
        }
      }
    }
  }

  .send-request-ok {
    color: #2ecc71;
  }
}
</style>
