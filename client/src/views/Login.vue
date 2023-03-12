<script setup lang="ts">
import { z } from "zod";
import { toFormValidator } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { useUser } from "@/shared/stores";
import type { LoginForm } from "@/shared/interfaces/LoginForm";
import { ref } from "vue";

const router = useRouter();
const userStore = useUser();

const showPassword = ref<boolean>(false);

const validationSchema = toFormValidator(
  z.object({
    email: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .email("Le format de l'email n'est pas valide : ("),
    password: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .max(100, "Le mot de passe ne peut dépasser 100 caractères : ("),
  })
);

const { handleSubmit, setErrors } = useForm<LoginForm>({
  validationSchema,
});

const submit = handleSubmit(async (formValue: LoginForm) => {
  try {
    await userStore.login(formValue);
    await router.push("/channels/me");
  } catch (e: string | any) {
    setErrors({
      password: e.message,
    });
  }
});

const { value: emailValue, errorMessage: emailError } = useField("email");
const { value: passwordValue, errorMessage: passwordError } =
  useField("password");

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
    <form @submit.prevent="submit" class="form d-flex flex-column">
      <img src="@/assets/images/buildconverse.png" alt="logo" class="mb-40" />
      <h2 class="mb-20">Hello !</h2>
      <div class="d-flex flex-column mb-10">
        <label for="email" class="mb-10">Email *</label>
        <div class="input d-flex flex-fill">
          <input
            v-focus
            autocomplete="username"
            v-model="emailValue"
            id="email"
            type="text"
          />
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
          <input
            autocomplete="current-password"
            v-model="passwordValue"
            id="mdp"
            type="password"
          />
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
      <button class="mb-20">Connexion</button>
      <div class="d-flex align-items-center">
        <p class="mr-10 register">Tu n'as pas encore de compte ?</p>
        <router-link to="/inscription"> Inscription </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
@import "@/assets/login-register.scss";

.register {
  color: var(--primary-2);
}
</style>
