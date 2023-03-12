<script setup lang="ts">
import { ref, watch } from "vue";
import uploadImgUrl from "@/assets/images/upload.svg";
import CreateServer from "@/features/me/components/community/CreateServer.vue";
import JoinServer from "@/features/me/components/community/JoinServer.vue";

let namespaceImage = ref<File>();
let src = ref<string | ArrayBuffer | null>();

const emit = defineEmits<{
  (e: "closePopup"): void;
}>();

function previewAvatar(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files![0];

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = () => {
    src.value = reader.result;
  };

  namespaceImage.value = file;
}

watch(namespaceImage, (NewValue) => {
  namespaceImage.value = NewValue;
});
</script>

<template>
  <div>
    <div @click.stop="emit('closePopup')" class="calc"></div>
    <div class="d-flex align-items-center flex-column add-server">
      <h2>Créer une communauté</h2>
      <label for="file" class="label-file">
        <img :src="src ? src : uploadImgUrl" />
      </label>
      <input
        @change="previewAvatar($event)"
        id="file"
        class="input-file"
        type="file"
      />
      <CreateServer
        @close-popup="emit('closePopup')"
        :namespace-image="namespaceImage"
      />
      <JoinServer @close-popup="emit('closePopup')" />
    </div>
  </div>
</template>

<style lang="scss">
.add-server {
  gap: 15px;
  background-color: var(--primary-4);
  position: fixed;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 25px;
  border-radius: 3px;
  z-index: 10;

  h2 {
    color: var(--primary-2);
  }

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    color: var(--primary-2);
  }

  input {
    padding: 0;
    font-size: 1.1rem;
    width: 280px;
    min-width: 150px;
    height: 40px;
    outline: none;
    border: none;
    border-radius: 0;
    border-bottom: 2px solid var(--primary-2);
    background-color: var(--primary-4);
    color: var(--text-color);

    &::placeholder {
      font-size: 1.1rem;
      color: var(--text-color);
    }
  }

  p {
    margin-bottom: 5px;
  }

  button {
    cursor: pointer;
    width: inherit;
    border: none;
    background-color: var(--primary-2);
    color: var(--text-color-white);
    outline: none;
    border-radius: 4px;
    padding: 10px;
    font-size: 1rem;

    &:hover {
      font-weight: 700;
    }
  }
}
</style>
