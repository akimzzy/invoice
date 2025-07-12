<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <transition name="bottom-sheet-invoice" appear>
      <div
        class="sm:rounded-3xl bg-[#18181b] w-full h-full max-h-full flex flex-col justify-end py-10 relative border border-white/10 sm:w-2xl max-w-2xl sm:h-[50rem] sm:max-h-[90vh] overflow-hidden"
      >
        <button
          class="absolute top-4 right-4 text-white/50 hover:text-white/60 text-xl cursor-pointer p-4"
          @click="$emit('close')"
        >
          <IconX class="size-4" />
        </button>
        <ClientFormInner
          :hide-close-icon="true"
          :client="client"
          @close="$emit('close')"
          class="border-0 shadow-none"
        />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import ClientFormInner from './ClientFormInner.vue'
import type { Client } from '@/db'
import IconX from './icons/IconX.vue'

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
