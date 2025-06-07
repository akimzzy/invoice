<template>
  <span
    class="relative inline-block w-12 h-12 rounded-full bg-gradient-to-t from-[#4b7378]/20 via-[#4b7378]/80 to-[#4b7378] animate-spin"
  >
    <span class="absolute inset-0 m-[2px] bg-[#263238] rounded-full"></span>
  </span>
</template>

<style scoped>
/* Optional: custom animation to match original keyframe more closely */
@keyframes custom-rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: custom-rotation 1s linear infinite;
}
</style>

