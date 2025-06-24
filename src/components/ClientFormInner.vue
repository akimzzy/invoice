<template>
  <div
    class="bg-[#18181b] rounded-3xl shadow-2xl w-full sm:w-2xl max-w-2xl p-6 py-8 relative border border-white/10"
  >
    <button
      v-if="!hideCloseIcon"
      class="absolute top-4 right-4 text-white/50 hover:text-white/60 text-2xl cursor-pointer p-4"
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
            type="text"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-white/30"
            placeholder="Client name"
          />
        </div>

        <div class="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <input
            v-model="form.phone"
            type="tel"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-white/30"
            placeholder="WhatsApp Number (optional)"
          />
          <input
            v-model="form.email"
            type="email"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-white/30"
            placeholder="Email (optional)"
          />
        </div>
      </div>
      <div class="flex justify-between mt-4">
        <div></div>
        <div class="flex gap-2">
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
      </div>
      <div
        v-if="isEdit"
        class="flex flex-col items-center justify-center mt-4 p-8 bg-white/3 rounded-"
      >
        <button
          type="button"
          class="px-4 py-2 rounded-lg bg-white border border-white/10 text-black hover:bg-red-700 transition-colors text-xs cursor-pointer"
          @click="handleDelete"
        >
          Delete client
        </button>
        <p class="text-[10px] text-center mt-4 text-white/60">
          This action is permanent. The client will be deleted and unlinked from all invoices.
        </p>
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
  hideCloseIcon?: boolean
}>()
const emit = defineEmits<{
  close: []
  saved: [id: string]
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
  let response: string | number
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
  emit('saved', String(response))
  emit('close')
}

async function handleDelete() {
  if (!props.client) return
  // Remove client reference from invoices
  const invoices = await db.invoices.where('clientId').equals(props.client.id).toArray()
  for (const invoice of invoices) {
    await db.invoices.update(invoice.id, { clientId: undefined })
  }
  await db.clients.delete(props.client.id)
  emit('close')
}
</script>
