<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <transition name="bottom-sheet-invoice" appear>
      <ClientFormInner :client="client" @close="$emit('close')" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import ClientFormInner from './ClientFormInner.vue'
import type { Client } from '@/db'

defineProps<{
  client?: Client | null
}>()
defineEmits(['close', 'saved'])
</script>

<style>
.bottom-sheet-invoice-enter-active,
.bottom-sheet-invoice-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.bottom-sheet-invoice-enter-from,
.bottom-sheet-invoice-leave-to {
  opacity: 0;
  transform: translateY(5%);
}
.bottom-sheet-invoice-enter-to,
.bottom-sheet-invoice-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
