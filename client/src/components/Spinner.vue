<template>
  <div class="lds_dual_ring"></div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.lds_dual_ring {
  display: inline-block;
  width: 40px;
  height: 40px;
}
.lds_dual_ring:after {
  content: " ";
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid;
  border-color: white transparent white transparent;
  animation: lds-dual-ring 1.2s linear infinite;
}
@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
