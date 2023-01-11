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
  <form
    @submit.prevent="submit"
    class="add-friend-container d-flex flex-column p-20"
  >
    <div class="title-container mb-20">
      <h4 class="mb-10">AJOUTER</h4>
      <p>Tu peux ajouter un ami grâce à son pseudo</p>
    </div>
    <div class="input-container d-flex align-items-center">
      <input
        v-focus
        v-model="pseudoValue"
        type="text"
        placeholder="Entre un pseudo"
      />
      <button>
        <div>Envoyer une demande d'ami</div>
      </button>
    </div>
    <p class="form-error" v-if="pseudoError">{{ pseudoError }}</p>
    <p class="send-request-ok" v-if="isRequestSend">Demande d'ami envoyé</p>
  </form>
</template>

<style scoped lang="scss">
.add-friend-container {
  width: 70%;
  flex-wrap: wrap;
  border-radius: 4px;
  margin-left: 15px;
  overflow: hidden;

  .title-container {
    flex: 1;
    p {
      font-size: 0.8rem;
    }
  }

  .input-container {
    width: 100%;
    justify-content: center;
    padding: 8px;
    min-height: 50px;
    max-height: 50px;
    background-color: var(--primary-3);
    border-radius: 8px;

    input {
      flex: 1;
      padding: 0;
      border: none;
      outline: none;
      background-color: var(--primary-3);
    }
    button {
      flex: 1;
      min-width: 60px;
      max-width: 200px;
      cursor: pointer;
      border: none;
      padding: 8px;
      background-color: #236cab;
      border-radius: 3px;

      div {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  .send-request-ok {
    color: #2ecc71;
  }
}

@media (max-width: 800px) {
  input {
    width: 100%;
  }
}
</style>
