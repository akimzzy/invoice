<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div
    class="relative min-h-screen bg-gradient-to-b from-black to-[#4b7378]/50 text-white font-mono"
  >
    <!-- <div class="absolute top-0 left-0 h-full w-full grid grid-cols-20 gap-4">
      <div v-for="i in 20" :key="i" class="bg-black/10 -z-0"></div>
    </div> -->
    <div class="z-20 absolute top-0 left-0 h-full w-full">
      <RouterView />
    </div>
  </div>
</template>
