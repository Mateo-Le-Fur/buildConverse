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
      <h3 class="mb-10">AJOUTER UN AMI</h3>
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
@use "@/assets/mixins.scss";
.add-friend-container {
  width: 70%;
  flex-wrap: wrap;
  border-radius: 4px;
  margin-left: 15px;
  overflow: hidden;
  @include mixins.md {
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 0;
    width: 100%;
  }

  .title-container {
    flex: 1;
    p {
      font-size: 0.9rem;
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

    @include mixins.md {
      align-items: center;
      min-height: 100px;
      max-height: 100px;
      flex-direction: column;
      background-color: var(--primary-1);
    }

    input {
      font-size: 1rem;
      flex: 1;
      padding: 0;
      border: none;
      outline: none;
      background-color: var(--primary-3);

      &::placeholder {
        font-size: 0.9rem;
        letter-spacing: 1px;
      }

      @include mixins.md {
        height: 30px;
        margin-bottom: 20px;
        padding: 25px 8px;
      }
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

      @include mixins.md {
        min-height: 45px;
        min-width: 200px;
        max-width: 250px;
      }

      div {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }
  }

  .form-error {
    margin-top: 0.2rem;
    text-align: left;

    @include mixins.md {
      margin-top: 1rem;
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
