<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div
    class="relative min-h-screen bg-gradient-to-b from-black to-[#4b7378]/50 text-white font-mono px-2 sm:px-0"
  >
    <div class="z-20 absolute top-0 left-0 h-full w-full">
      <RouterView />
    </div>
  </div>
</template>
