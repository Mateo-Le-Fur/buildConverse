<script setup lang="ts"></script>

<template>
  <div class="search-bar-container">
    <div class="d-flex align-items-center">
      <input type="text" placeholder="Rechercher un ami" />
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <!--! Font Awesome Pro 6.2.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
        <path
          d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search-bar-container {
  padding: 10px;
  max-height: 50px;
  background-color: var(--primary-2);
  //border-bottom: 1px solid #242526;
  box-shadow: 0 4px 6px -6px black;

  div {
    background-color: var(--primary-3);
    border-radius: 5px;
  }
}

input {
  outline: none;
  border: none;
  background-color: var(--primary-3);
}
svg {
  display: block;
  width: 15px;
  height: 15px;
  fill: white;
}
</style>
