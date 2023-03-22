<script setup lang="ts">
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";
import { useSocket } from "@/shared/stores/socketStore";
import { useNsUser } from "@/features/server/stores/userNsStore";
import { useRoute } from "vue-router";
import Member from "@/features/server/components/member/Member.vue";
import { ref } from "vue";
import MemberProfil from "@/features/server/components/member/MemberProfil.vue";
import type { User } from "@/shared/interfaces/User";
import type { FriendsInterface } from "@/shared/interfaces/FriendsInterface";

const route = useRoute();

const socketStore = useSocket();
const userNsStore = useNsUser();

const isMemberProfilOpen = ref<boolean>(false);
const member = ref<User | FriendsInterface>();

function loadMoreUser(e: Event) {
  const target = e.target as HTMLDivElement;
  if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
    socketStore.ioClient?.emit("loadMoreUser", {
      currentArrayLength: userNsStore.userList.length,
      namespaceId: route.params.serverId,
    });
  }
}

function viewProfil(user: User | FriendsInterface) {
  member.value = user;
  isMemberProfilOpen.value = true;
}
</script>

<template>
  <slot></slot>

  <div
    class="members-container d-flex flex-column"
    :style="!isMemberProfilOpen ? 'height: 70% !important' : 'padding: 0;'"
  >
    <h2 class="p-20" v-if="!isMemberProfilOpen">
      {{ userNsStore.numberOfUsers }} membres dans la communauté !
    </h2>
    <Transition mode="out-in">
      <RecycleScroller
        v-if="!isMemberProfilOpen"
        @scroll="loadMoreUser($event)"
        :items="userNsStore.getUsersNamespace($route.params.serverId)"
        :item-size="65"
        v-slot="{ item }"
        class="scroller p-20"
      >
        <Member :member="item" @view-profil="viewProfil" />
      </RecycleScroller>
      <MemberProfil
        v-else
        :member="userNsStore.viewMemberProfil(member?.id)"
        @back-to-member-list="isMemberProfilOpen = false"
      />
    </Transition>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";

.v-enter-active,
.v-leave-active {
  transition: all 0.2s linear;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.members-container {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(calc(-50% + 30px));
  gap: 15px;
  width: 30%;
  min-width: 240px;
  background-color: var(--primary-4);
  border-radius: 5px;
  overflow: hidden;
  min-height: 350px;
  max-height: 70%;
  z-index: 5;

  h2 {
    text-align: center;
    color: var(--text-color);
  }

  .scroller {
    height: 100%;
  }
}
</style>
