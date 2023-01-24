<script setup lang="ts">
import Profil from "@/components/Profil.vue";
import SearchBar from "@/features/home/components/SearchBar.vue";
import { onMounted, reactive, ref, watch } from "vue";
import { useMe } from "@/features/home/stores/meStore";
import { useRoute } from "vue-router";
import { useSocket } from "@/shared/stores/socketStore";
import { router } from "@/routes";

const socketStore = useSocket();
const meStore = useMe();

const route = useRoute();

const recipientHover = ref<boolean>(false);
const recipientId = ref<number | null>(null);

function onHover(id: number) {
  recipientId.value = id;
  recipientHover.value = true;
}

function onLeave() {
  recipientHover.value = false;
}

async function disableConversation(privateRoomId: number) {
  const { id } = await (
    await fetch(`/api/user/user/disable-channel/${privateRoomId}`, {
      method: "POST",
    })
  ).json();

  meStore.disableConversation(id);

  await router.push("/channels/me");

  if (meStore.currentRecipient) {
    meStore.currentRecipient = null;
  }
}

watch(
  () => route.params.privateRoomId,
  (value) => {
    if (value) {
      meStore.isBeginningConversation = false;
      meStore.messages = [];
      meStore.getCurrentConversation(Number(value));
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="container d-flex flex-column flex-fill">
    <SearchBar />
    <nav class="nav-container d-flex flex-column flex-fill p-8">
      <router-link @click="meStore.currentRecipient = null" to="/channels/me">
        <div
          :class="{
            active: meStore.currentRecipient === null,
          }"
          class="d-flex align-items-center g-10 friend p-10 mb-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
            <path
              d="M352 128c0 70.7-57.3 128-128 128s-128-57.3-128-128S153.3 0 224 0s128 57.3 128 128zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3zM609.3 512H471.4c5.4-9.4 8.6-20.3 8.6-32v-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2h61.4C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"
            />
          </svg>
          <p>Amis</p>
        </div>
      </router-link>

      <div class="private-message-container d-flex flex-column g-5">
        <p class="p-10">Messages Privés</p>
        <div
          v-for="recipient of meStore.recipients.filter(
            (recipient) => recipient.active === true
          )"
          :class="{
            active:
              recipient.privateRoomId ===
              meStore.currentRecipient?.privateRoomId,
          }"
          :key="recipient.id"
          class="private-message d-flex flex-column"
        >
          <router-link
            @mouseover="onHover(recipient.id)"
            @mouseleave="onLeave()"
            class="d-flex align-items-center g-10"
            :to="`/channels/me/${recipient.privateRoomId}`"
          >
            <div class="d-flex align-items-center flex-fill g-10">
              <div class="avatar">
                <img :src="recipient.avatarUrl" />
              </div>
              <div>
                <p>{{ recipient.pseudo }}</p>
              </div>
            </div>
            <div>
              <svg
                @click.stop.prevent="
                  disableConversation(recipient.privateRoomId)
                "
                :class="{
                  deleteButton:
                    recipientHover === true && recipient.id === recipientId,
                }"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
              >
                <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
                <path
                  d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
                />
              </svg>
            </div>
          </router-link>
        </div>
      </div>
    </nav>
    <Profil />
  </div>
</template>

<style scoped lang="scss">
.container {
  background-color: var(--primary-2);

  .nav-container {
    width: 240px;

    a {
      color: #f4f4f4;
      text-decoration: none;
    }

    .friend {
      height: 40px;
      border-radius: 5px;

      svg {
        width: 25px;
        height: 25px;
        fill: white;
      }
    }

    .private-message-container {
      .private-message {
        border-radius: 5px;
        padding: 2px 10px;

        &:hover {
          background-color: var(--primary-1);
        }

        svg {
          display: none;
        }

        .deleteButton {
          display: block;
          width: 15px;
          height: 15px;
          fill: #dddddd;
        }
      }

      .avatar {
        width: 40px;
        height: 40px;

        img {
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
      }
    }
  }
}
</style>
