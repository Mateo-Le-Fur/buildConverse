<script setup lang="ts">
import type { User } from "@/shared/interfaces/User";
import type { RouteParams } from "vue-router";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

defineProps<{
  userList: User[];
  params: RouteParams;
}>();
</script>

<template>
  <div class="user-container d-flex flex-column">
    <p>Membres: {{ userList.length }}</p>
    <DynamicScroller :items="userList" :min-item-size="54" class="scroller">
      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
          :size-dependencies="[item.name]"
        >
          <div class="user d-flex align-items-center">
            <img :src="'data:image/jpeg;base64,' + item.avatar_url" />
            <p :class="{ admin: item.UserHasNamespace?.admin }">
              {{ item.pseudo }}
            </p>
            <div
              :class="{
                online: item.status === 'online',
                offline: item.status === 'offline',
              }"
            ></div>
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<style scoped lang="scss">
.scroller {
  height: 100%;
}

.user-container {
  padding: 15px 2px 15px 15px;
  gap: 15px;
  width: 240px;
  min-width: 240px;
  background-color: var(--primary-2);

  .user {
    gap: 15px;
    padding-bottom: 15px;
  }

  div {
    position: relative;
    img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .online {
      position: absolute;
      bottom: 15px;
      left: 25px;
      background-color: green;
      height: 17px;
      width: 17px;
      border-radius: 100%;
      border: 3px solid var(--primary-2);
    }

    .offline {
      position: absolute;
      bottom: 15px;
      left: 25px;
      background-color: #6d6d6d;
      height: 17px;
      width: 17px;
      border-radius: 100%;
      border: 3px solid var(--primary-2);
    }
  }
}

.admin {
  color: #e80354;
}
</style>
