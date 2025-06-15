<template>
  <div class="flex flex-col divide-y divide-white/10 overflow-y-auto flex-1">
    <textarea
      class="text-white bg-transparent outline-none w-full flex resize-none focus:bg-white/5 placeholder:text-white/15 border-white/10 h-full rounded-xl p-2 border text-[10px]"
      :value="note"
      @input="$emit('update:note', $event.target.value)"
      autofocus
      placeholder="Add a note for your client..."
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  note: { type: String, default: '' },
})
</script>
