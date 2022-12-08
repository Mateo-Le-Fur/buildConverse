<script setup lang="ts">
import { z } from "zod";
import { toFormValidator } from "@vee-validate/zod";
import { useField, useForm } from "vee-validate";
import type { UserForm } from "@/shared/interfaces/UserForm";
import { createUser } from "@/shared/services/auth.service";
import { useRouter } from "vue-router";

const router = useRouter();

const validationSchema = toFormValidator(
  z.object({
    pseudo: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .min(4, "Le pseudo doit contenir au moins 4 caractères : ("),
    email: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .email("Le format de l'email n'est pas valide : ("),
    password: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  })
);

const { handleSubmit, setErrors } = useForm<UserForm>({
  validationSchema,
});

const submit = handleSubmit(async (formValue: UserForm) => {
  try {
    await createUser(formValue);
    await router.push("/channels/me");
  } catch (e: string | any) {
    setErrors({
      email: e.message,
    });
  }
});

const { value: pseudoValue, errorMessage: pseudoError } = useField("pseudo");
const { value: emailValue, errorMessage: emailError } = useField("email");
const { value: passwordValue, errorMessage: passwordError } =
  useField("password");
</script>

<template>
  <div class="form-signup-container d-flex flex-column align-items-center">
    <h2 class="mb-20">Bienvenue !</h2>
    <form @submit.prevent="submit" class="form-signup">
      <div class="d-flex flex-column mb-10">
        <label for="pseudo" class="mb-10">Pseudo *</label>
        <input class="mb-5" v-model="pseudoValue" id="pseudo" type="text" />
        <p class="validation-error" v-if="pseudoError">{{ pseudoError }}</p>
      </div>
      <div class="d-flex flex-column mb-10">
        <label for="email" class="mb-10">Email *</label>
        <input class="mb-5" v-model="emailValue" id="email" type="text" />
        <p class="validation-error" v-if="emailError">{{ emailError }}</p>
      </div>
      <div class="d-flex flex-column mb-20">
        <label for="mdp" class="mb-10">Mot de passe *</label>
        <input class="mb-5" v-model="passwordValue" id="mdp" type="password" />
        <p class="validation-error" v-if="passwordError">{{ passwordError }}</p>
      </div>
      <button class="mb-20">Inscription</button>
      <div class="d-flex align-items-center">
        <p class="mr-10">Tu as déjà un compte ?</p>
        <router-link to="/connexion"> Connexion </router-link>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss"></style>
