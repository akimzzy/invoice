<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-60 flex items-center justify-center bg-black/60 text-xs"
  >
    <div class="bg-[#18181b] rounded-2xl p-8 shadow-2xl flex flex-col items-center">
      <div class="text-white text-sm font-semibold mb-4">Confirm Deletion</div>
      <div class="text-white/70 mb-6">
        Are you sure you want to delete this invoice? This action cannot be undone.
      </div>
      <div class="flex gap-4">
        <button
          class="px-4 py-2 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 cursor-pointer"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
          @click="$emit('confirm')"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
defineEmits(['confirm', 'cancel'])
</script>
