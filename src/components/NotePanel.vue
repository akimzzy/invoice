<template>
  <div class="flex flex-col divide-y divide-white/10 overflow-y-auto flex-1">
    <textarea
      class="text-white bg-transparent outline-none w-full flex resize-none focus:bg-white/5 placeholder:text-white/15 border-white/10 h-full rounded-xl p-2 border text-[10px]"
      ref="noteRef"
      v-model="localNote"
      @input="debounceUpdateItem"
      placeholder="Add a note for your client..."
    />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, onMounted } from 'vue'

const props = defineProps<{ note: string }>()
const emit = defineEmits<{ 'update:note': [note: string] }>()

const localNote = ref(props.note)
const noteRef = ref<HTMLTextAreaElement | null>(null)

function updateNote() {
  if (localNote.value !== props.note) {
    emit('update:note', localNote.value)
  }
}

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

function debounceUpdateItem() {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    updateNote()
  }, 500)
}

onMounted(() => {
  noteRef.value?.focus()
})

onUnmounted(() => {
  updateNote()
})
</script>
