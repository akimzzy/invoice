<template>
  <div
    class="bg-[#18181b] rounded-3xl shadow-2xl w-full sm:w-2xl max-w-2xl p-6 py-8 relative border border-white/10"
  >
    <button
      class="absolute top-4 right-4 text-white/30 hover:text-white/60 text-2xl cursor-pointer p-4"
      @click="$emit('close')"
    >
      <IconX class="size-4" />
    </button>
    <h2 class="text-lg font-semibold mb-6 text-white">
      {{ isEdit ? 'Edit Client' : 'Add Client' }}
    </h2>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 text-xs">
      <div class="flex flex-col justify-between gap-4">
        <div class="flex-1 flex items-center gap-2">
          <!-- <label class="block text-xs mb-1 text-white/70 w-16">Name</label> -->
          <input
            v-model="form.name"
            required
            class="w-full border border-white/10 bg-transparent rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            placeholder="Client name"
          />
        </div>

        <div class="flex-1 flex items-center gap-2">
          <input
            v-model="form.phone"
            class="w-full border border-white/10 bg-transparent rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            placeholder="WhatsApp Number (optional)"
          />
          <input
            v-model="form.email"
            type="email"
            class="w-full border border-white/10 bg-transparent rounded-lg p-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30"
            placeholder="Email (optional)"
          />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors text-xs cursor-pointer"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors text-xs cursor-pointer"
        >
          {{ isEdit ? 'Save' : 'Add' }} Client
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Client } from '@/db'
import { db } from '@/db'
import IconX from './icons/IconX.vue'

const props = defineProps<{
  client?: Client | null
}>()
// const emit = defineEmits(['close', 'saved'])
const emit = defineEmits<{
  close: []
  saved: [id: number]
}>()
const isEdit = computed(() => !!props.client)
const form = ref({
  name: '',
  email: '',
  phone: '',
})

watch(
  () => props.client,
  (client) => {
    if (client) {
      form.value = {
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
      }
    } else {
      form.value = { name: '', email: '', phone: '' }
    }
  },
  { immediate: true },
)

async function handleSubmit() {
  if (!form.value.name.trim()) return
  let response: number
  if (isEdit.value && props.client) {
    response = await db.clients.update(props.client.id, {
      name: form.value.name,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
    })
  } else {
    response = await db.clients.add({
      name: form.value.name,
      email: form.value.email || undefined,
      phone: form.value.phone || undefined,
    })
  }
  emit('saved', response)
  emit('close')
}
</script>
