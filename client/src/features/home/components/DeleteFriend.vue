<script setup lang="ts">
const emit = defineEmits<{
  (e: "closePopup"): void;
  (e: "deleteFriend"): void;
}>();
</script>

<template>
  <div @click="emit('closePopup')" class="calc"></div>
  <div class="delete-popup d-flex align-items-center flex-column">
    <h3>Es-tu sûr de vouloir supprimer cet ami ?</h3>
    <p class="mb-10">
      Tous les messages échangés avec cet utilisateur seront aussi supprimés
    </p>
    <div class="d-flex align-items-center justify-content-center g-15">
      <button @click="emit('closePopup')" class="btn btn-primary">
        J'ai changé d'avis
      </button>
      <button @click="emit('deleteFriend'), emit('closePopup')" class="btn btn-danger">
        Sûr et Certain
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.delete-popup {
  gap: 15px;
  background-color: var(--primary-3);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 25px;
  max-width: 400px;
  text-align: center;
  border-radius: 10px;
  z-index: 10;

  h3 {
    border-bottom: 2px solid #f4f4f4;
  }

  button {
    width: 170px;
    font-size: 1.1rem;
  }
}
</style>
