<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { User } from "@/shared/interfaces/User";
import { reactive, ref } from "vue";
import { getFriends } from "@/features/me/services/friend.service";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import AddFriend from "@/components/friend/AddFriend.vue";

const state = reactive<{
  friends: FriendsInterface[] | null;
}>({
  friends: null,
});

const validationSchema = toFormValidator(
  z.object({
    pseudo: z
      .string({ required_error: "Le champ doit être remplie : (" })
      .min(1, { message: "1 caractère minimum requis" }),
  })
);

const { handleSubmit, setErrors } = useForm<User>({
  validationSchema,
});

const submit = handleSubmit(async (formValue: User) => {
  try {
    state.friends = await getFriends(formValue);
  } catch (e: string | any) {
    setErrors({ pseudo: e.message });
  }
});

const { value: pseudoValue, errorMessage: pseudoError } = useField(
  "pseudo",
  {},
  { validateOnValueUpdate: false }
);
</script>

<template>
  <form
    @submit.prevent="submit"
    class="add-friend-container d-flex align-items-center flex-column p-15"
  >
    <h3 class="title mb-10">Ajouter un ami</h3>
    <div class="add-friend d-flex align-items-center g-5">
      <input
        v-focus
        v-model="pseudoValue"
        type="text"
        placeholder="Entre un pseudo"
      />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
        <path
          d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
        />
      </svg>
    </div>
    <p class="form-error" v-if="pseudoError">{{ pseudoError }}</p>
  </form>
  <div
    v-show="state.friends"
    class="show-friends-container d-flex flex-column g-5"
  >
    <AddFriend
      v-for="friend of state.friends"
      :key="friend.id"
      :friend="friend"
    />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";
.add-friend-container {
  border-radius: 4px;
  @include mixins.md {
    justify-content: center;
    align-items: center;
    text-align: center;
    margin: 0;
    width: 100%;
  }

  .title {
    font-family: "Satoshi", sans-serif;
    font-weight: 700;
    text-align: center;
    font-size: 1.7rem;
    color: var(--primary-2);
  }

  .add-friend {
    max-height: 40px;
    background-color: var(--primary-4);
    padding: 5px;
    border: 2px solid var(--primary-2);
    border-radius: 8px;
    input {
      min-width: 250px;
      color: var(--text-color);
      font-size: 1.1rem;
      padding: 5px 15px 5px 0;
      border: none;
      outline: none;
      background-color: var(--primary-4);
      &::placeholder {
        color: var(--text-color);
        font-size: 1.1rem;
        letter-spacing: 0.5px;
      }

      @include mixins.md {
        height: 30px;
        margin-bottom: 20px;
        padding: 25px 8px;
      }
    }

    svg {
      cursor: pointer;
      width: 15px;
      height: 15px;
      fill: var(--primary-2);
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
