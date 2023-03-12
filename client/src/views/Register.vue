<script setup lang="ts">
import { z } from "zod";
import { toFormValidator } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import type { UserForm } from "@/shared/interfaces/UserForm";
import { createUser } from "@/shared/services/auth.service";
import { useRouter } from "vue-router";
import { onUnmounted, ref } from "vue";
import { useSocket } from "@/shared/stores/socketStore";

const router = useRouter();
const socketStore = useSocket();

const showPassword = ref<boolean>(false);

onUnmounted(() => {
  socketStore.error = null;
});

const validationSchema = toFormValidator(
  z.object({
    pseudo: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .min(4, "Le pseudo doit contenir au moins 4 caractères : (")
      .max(30, "Le pseudo ne peut dépasser 30 caractères : ("),
    email: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .email("Le format de l'email n'est pas valide : ("),
    password: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .regex(
        new RegExp(
          "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$"
        ),
        "Le mot de passe doit contenir minimum 8 caractères , 1 majuscule, 1 caractère spécial et 1 chiffre !"
      ),
  })
);

const { handleSubmit, setErrors } = useForm<UserForm>({
  validationSchema,
});

const submit = handleSubmit(async (formValue: UserForm) => {
  try {
    await createUser(formValue);
    await router.push("/channels/me");
  } catch (e: any) {
    socketStore.setError(e.message);
  }
});

const { value: pseudoValue, errorMessage: pseudoError } = useField(
  "pseudo",
  {},
  { validateOnValueUpdate: false }
);
const { value: emailValue, errorMessage: emailError } = useField(
  "email",
  {},
  { validateOnValueUpdate: false }
);
const { value: passwordValue, errorMessage: passwordError } = useField(
  "password",
  {},
  { validateOnValueUpdate: false }
);

function displayPassword() {
  showPassword.value = !showPassword.value;

  const passwordInput: HTMLInputElement | null = document.querySelector("#mdp");

  if (passwordInput) {
    showPassword.value
      ? (passwordInput.type = "text")
      : (passwordInput.type = "password");
  }
}
</script>

<template>
  <div class="form-container d-flex flex-column align-items-center">
    <span class="mb-10 form-error" v-if="socketStore.error">{{
      socketStore.error
    }}</span>
    <form @submit.prevent="submit" class="form d-flex flex-column">
      <img src="@/assets/images/buildconverse.png" alt="logo" class="mb-40" />
      <h2 class="mb-20">Bienvenue !</h2>
      <div class="d-flex flex-column mb-10">
        <label for="pseudo" class="mb-10">Pseudo *</label>
        <div class="input d-flex flex-fill">
          <input v-focus v-model="pseudoValue" id="pseudo" type="text" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
            />
          </svg>
        </div>
        <p class="validation-error" v-if="pseudoError">{{ pseudoError }}</p>
      </div>
      <div class="d-flex flex-column mb-10">
        <label for="email" class="mb-10">Email *</label>
        <div class="input d-flex flex-fill">
          <input v-model="emailValue" id="email" type="text" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M256 64C150 64 64 150 64 256s86 192 192 192c17.7 0 32 14.3 32 32s-14.3 32-32 32C114.6 512 0 397.4 0 256S114.6 0 256 0S512 114.6 512 256v32c0 53-43 96-96 96c-29.3 0-55.6-13.2-73.2-33.9C320 371.1 289.5 384 256 384c-70.7 0-128-57.3-128-128s57.3-128 128-128c27.9 0 53.7 8.9 74.7 24.1c5.7-5 13.1-8.1 21.3-8.1c17.7 0 32 14.3 32 32v80 32c0 17.7 14.3 32 32 32s32-14.3 32-32V256c0-106-86-192-192-192zm64 192a64 64 0 1 0 -128 0 64 64 0 1 0 128 0z"
            />
          </svg>
        </div>
        <p class="validation-error" v-if="emailError">{{ emailError }}</p>
      </div>
      <div class="d-flex flex-column mb-20">
        <label for="mdp" class="mb-10">Mot de passe *</label>
        <div class="input d-flex flex-fill mb-5">
          <input v-model="passwordValue" id="mdp" type="password" />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
            <path
              d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
            />
          </svg>
        </div>
        <div class="d-flex align-items-center display-password">
          <label>Afficher le mot de passe</label>
          <input @click="displayPassword()" type="checkbox" />
        </div>
        <p class="validation-error" v-if="passwordError">
          {{ passwordError }}
        </p>
      </div>
      <button class="mb-20">Inscription</button>
      <div class="d-flex align-items-center">
        <p class="mr-10 login">Tu as déjà un compte ?</p>
        <router-link to="/connexion"> Connexion </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/login-register.scss";

.login {
  color: var(--primary-2);
}
</style>
