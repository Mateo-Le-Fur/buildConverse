<script setup lang="ts">
import { ref, watch } from "vue";
import uploadImgUrl from "@/assets/images/upload.svg";
import CreateServer from "@/components/namespace/CreateServer.vue";
import JoinServer from "@/components/namespace/JoinServer.vue";

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
      <h2>Créer un serveur</h2>
      <label for="file" class="label-file">
        <img style="color: white" :src="src ? src : uploadImgUrl" />
      </label>
      <input
        @change="previewAvatar($event)"
        id="file"
        class="input-file"
        type="file"
      />
      <CreateServer :namespace-image="namespaceImage" />
      <JoinServer @close-popup="emit('closePopup')" />
    </div>
  </div>
</template>

<style lang="scss">
.add-server {
  gap: 15px;
  background-color: var(--primary-3);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  padding: 25px;
  border-radius: 10px;
  z-index: 10;

  img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
  }

  input {
    font-size: 1rem;
    width: 250px;
    height: 40px;
    outline: none;
    border: none;
    background-color: var(--primary-2);

    &::placeholder {
      font-size: 1rem;
    }
  }

  p {
    margin-bottom: 5px;
  }

  button {
    cursor: pointer;
    width: inherit;
    background-color: var(--yellow);
    color: black;
    outline: none;
    border: none;
    border-radius: 3px;
    padding: 10px;
    font-size: 1rem;
  }
}
</style>
