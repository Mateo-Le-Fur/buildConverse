<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "hide"): void;
  (e: "display"): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" @click="emit('hide')" class="calc"></div>
    <div class="d-flex">
      <div>
        <div @click="emit('display')" class="burger"></div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
@use "@/assets/mixins.scss";

.burger,
.burger::before,
.burger::after {
  display: none;
  background-color: #f4f4f4;
  position: absolute;
  height: 4px;
  width: 30px;
  transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1);
  border-radius: 2px;
  z-index: 3;

  @include mixins.xs {
    display: block;
  }
}

.burger {
  top: 24px;
  left: 10px;
}

.burger::before {
  content: "";
  margin-top: -8px;
}

.burger::after {
  content: "";
  margin-top: 8px;
}
</style>
