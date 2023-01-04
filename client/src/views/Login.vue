<script setup lang="ts">
import { z } from "zod";
import { toFormValidator } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import { useRouter } from "vue-router";
import { useUser } from "@/shared/stores";
import type { LoginForm } from "@/shared/interfaces/LoginForm";

const router = useRouter();
const userStore = useUser();

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
</script>

<template>
  <div>
    <div class="background"></div>
    <div class="form-signup-container d-flex flex-column align-items-center">
      <form @submit.prevent="submit" class="form-signup d-flex flex-column">
        <h2 class="mb-20">Hello !</h2>
        <div class="d-flex flex-column mb-10">
          <label for="email" class="mb-10">Email *</label>
          <input
            autocomplete="username"
            class="mb-5"
            v-model="emailValue"
            id="email"
            type="text"
          />
          <p class="validation-error" v-if="emailError">{{ emailError }}</p>
        </div>
        <div class="d-flex flex-column mb-20">
          <label for="mdp" class="mb-10">Mot de passe *</label>
          <input
            autocomplete="current-password"
            class="mb-5"
            v-model="passwordValue"
            id="mdp"
            type="password"
          />
          <p class="validation-error" v-if="passwordError">
            {{ passwordError }}
          </p>
        </div>
        <button class="mb-20">Connexion</button>
        <div class="d-flex align-items-center">
          <p class="mr-10">Tu n'as pas encore de compte ?</p>
          <router-link to="/inscription"> Inscription </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
