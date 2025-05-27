<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="text-2xl font-semibold text-white/70 mb-2">
      <slot name="icon"> </slot>
      {{ message }}
    </div>
    <div class="mt-6">
      <slot name="button">
        <button
          @click="$emit('add')"
          class="px-4 py-2 rounded-lg bg-white text-black text-xs font-medium shadow hover:bg-white/90 transition flex gap-2 items-center"
        >
          <IconPlus class="size-3" />
          Add New
        </button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import IconPlus from '../components/icons/IconPlus.vue'

defineProps<{ message: string }>()
defineEmits(['add'])
</script>
