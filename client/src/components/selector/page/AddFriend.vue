<script setup lang="ts">
import { toFormValidator } from "@vee-validate/zod";
import { z } from "zod";
import { useField, useForm } from "vee-validate";
import type { User } from "@/shared/interfaces/User";
import { reactive, ref } from "vue";
import { addFriends } from "@/features/me/services/friend.service";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";
import { useSocket } from "@/shared/stores/socketStore";
import { useMe } from "@/features/me/stores/meStore";
import { getUserAvatar } from "@/utils/getUserAvatar";

const socketStore = useSocket();
const meStore = useMe();
const isRequestSend = ref<boolean>(false);
const targetId = ref<number>();
const avatarURL = import.meta.env.VITE_AVATAR;

const state = reactive<{
  friends: FriendsInterface[] | null;
  requests: string[];
}>({
  friends: null,
  requests: [],
});

const emit = defineEmits<{
  (e: "navigate", page: string): void;
}>();

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
    state.friends = await addFriends(formValue);
  } catch (e: string | any) {
    setErrors({ pseudo: e.message });
  }
});

const { value: pseudoValue, errorMessage: pseudoError } = useField("pseudo");

function sendRequest(pseudo: string) {
  if (requestsSent(pseudo)) return;

  socketStore.ioClient?.emit(
    "friendRequest",
    {
      pseudo: pseudo,
    },
    (request: { status: string; message: string }) => {
      if (request.status !== "ok") {
        setErrors({
          pseudo: request.message,
        });
      } else {
        state.requests.push(pseudo);
        isRequestSend.value = true;
      }
    }
  );
}

function requestsSent(pseudo: string): boolean {
  return state.requests.some((element) => element === pseudo);
}

function getConversationWithAFriend(friendId: number) {
  const foundConversation = meStore.recipients.find(
    (conversation) => conversation.id === friendId
  );

  emit("navigate", "Recipient");

  socketStore.ioClient?.emit("getConversationWithAFriend", {
    friendId,
    privateRoomId: foundConversation?.privateRoomId,
  });
}
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
  <div v-show="state.friends" class="show-friends-container">
    <div
      v-for="friend of state.friends"
      class="show-friend d-flex align-items-center flex-fill g-10"
    >
      <div class="avatar d-flex align-items-center">
        <img :src="getUserAvatar(friend.id)" :alt="friend.pseudo" />
      </div>
      <div
        class="d-flex w-100 justify-content-space-between align-items-center g-10"
      >
        <span class="pseudo">
          {{ friend.pseudo }}
        </span>
        <span
          v-if="
            !requestsSent(friend.pseudo) &&
            !friend.requestAlreadySent &&
            !friend.alreadyFriend
          "
          @click="sendRequest(friend.pseudo)"
          class="send-request"
          >Ajouter un ami</span
        >
        <span
          v-else-if="
            requestsSent(friend.pseudo) ||
            (friend.requestAlreadySent && !friend.alreadyFriend)
          "
          @click="sendRequest(friend.pseudo)"
          class="send-request"
          >Demande Envoyé</span
        >
        <span
          v-else-if="friend.alreadyFriend"
          @click="getConversationWithAFriend(friend.id)"
          class="send-request"
          >Envoyer un message</span
        >
      </div>
    </div>
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

.show-friends-container {
  .show-friend {
    padding: 12px 15px;
    border-radius: 10px;

    &:hover {
      background-color: var(--primary-1);

      .pseudo {
        color: var(--text-color-white);
        font-weight: 500;
      }

      .send-request {
        color: var(--text-color-white);
        border: 1px solid var(--primary-4);
      }
    }
  }

  .pseudo {
    color: var(--text-color);
    font-weight: 500;
  }

  .send-request {
    cursor: pointer;
    color: var(--primary-1);
    font-weight: 500;
    padding: 5px;
    border-radius: 5px;
    font-size: 0.8rem;
    border: 1px solid var(--primary-1);

    &:hover {
      color: var(--primary-2) !important;
      background: var(--primary-4);
    }
  }

  .avatar {
    img {
      width: 45px;
      height: 45px;
    }
  }
}

@media (max-width: 800px) {
  input {
    width: 100%;
  }
}
</style>
