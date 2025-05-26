<script setup lang="ts">
import { ref, toRaw, defineProps, defineEmits } from 'vue'
import IconTrash from './icons/IconTrash.vue'
import IconPerson from './icons/IconPerson.vue'
import IconX from './icons/IconX.vue'
import CustomCheckbox from './CustomCheckbox.vue'
import CustomDropdown from './CustomDropdown.vue'
import ItemForm from './ItemForm.vue'
import { formatDate } from 'date-fns'

import type { Invoice, Client, InvoiceItem } from '@/db'
import { updateInvoiceItems, deleteInvoice, updateInvoice } from '@/db/invoiceActions.ts'

const props = defineProps<{ invoice: Invoice; clients: Client[] }>()
const emit = defineEmits(['close'])

const markedItems = ref<number[]>([])
const editingIdx = ref<number | null>(null)
const showDeleteConfirm = ref(false)

const handleCheckbox = (checked: boolean, idx: number) => {
  const marked = [...markedItems.value]
  if (checked) {
    if (!marked.includes(idx)) marked.push(idx)
  } else {
    const i = marked.indexOf(idx)
    if (i !== -1) marked.splice(i, 1)
  }
  markedItems.value = marked
}

const handleItemUpdate = async (val: InvoiceItem, idx: number) => {
  if (!props.invoice) return
  try {
    const { items } = toRaw(props.invoice)
    items.splice(idx, 1, val)
    await updateInvoiceItems(props.invoice.id, items)
  } catch (error) {
    console.log(error)
  }
}

async function deleteMarkedItems() {
  if (!props.invoice) return

  let { items } = toRaw(props.invoice)
  items = items.filter(
    (_item: { description: string; quantity: number; rate: number }, idx: number) =>
      !markedItems.value.includes(idx),
  )

  if (items.length === 0) {
    items = [{ description: '', quantity: 1, rate: 0 }]
  }

  await updateInvoiceItems(props.invoice.id, items)
  markedItems.value = []
}

async function addInvoiceItem() {
  if (!props.invoice) return

  try {
    const { items } = toRaw(props.invoice)
    await updateInvoiceItems(props.invoice.id, [
      ...items,
      { description: '', quantity: 1, rate: 0 },
    ])
  } catch (error) {
    console.log(error)
  }
}

async function handleDeleteInvoice() {
  if (!props.invoice) return
  try {
    await deleteInvoice(props.invoice.id)
    showDeleteConfirm.value = false
    emit('close')
  } catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click.self="() => emit('close')"
  >
    <div
      class="rounded-3xl rounded-t-none bg-[#18181b] shadow-2xl w-2xl h-[50rem] max-w-full p-6 flex flex-col relative"
    >
      <div
        class="text-xs text-white/40 absolute h-10 left-0 -top-10 rounded-t-3xl p-6 bg-[#18181b] flex place-items-center"
      >
        {{ formatDate(props.invoice?.issueDate, 'EEE, dd MMM yyyy | HH:mm') }}
      </div>

      <button
        class="text-xs text-white cursor-pointer hover:text-white/50 absolute h-10 right-0 -top-10 rounded-t-3xl p-6 bg-[#18181b] flex place-items-center"
        @click="() => emit('close')"
      >
        <IconX class="size-4" />
      </button>

      <div class="text-lg font-semibold text-white mb-6">Invoice #{{ props.invoice?.id }}</div>
      <div class="mb-2 flex-1">
        <div class="flex items-center justify-between mb-1">
          <div class="text-xs text-white/70">Items</div>
          <button
            class="text-xs px-2 py-1 rounded disabled:opacity-20 disabled:cursor-not-allowed"
            :disabled="!markedItems.length"
            @click="deleteMarkedItems"
            type="button"
          >
            <IconTrash class="size-4 text-white" />
          </button>
        </div>
        <ul class="flex flex-col divide-y mt-4 divide-white/10">
          <li
            v-for="(item, idx) in props.invoice?.items"
            :key="item.description + idx"
            class="flex text-xs text-white/90 items-center gap-2 relative group"
            @mouseenter="editingIdx = idx"
            @mouseleave="editingIdx = null"
          >
            <CustomCheckbox
              :model-value="markedItems.includes(idx)"
              @update:model-value="(checked) => handleCheckbox(checked, idx)"
              :disabled="!props.invoice"
            />
            <div class="flex flex-col flex-1 justify-center">
              <ItemForm
                :key="idx"
                :item="item"
                :hovered="editingIdx === idx"
                @update:item="(val) => handleItemUpdate(val, idx)"
              />
            </div>
          </li>
        </ul>
        <button
          class="text-xs p-3 bg- text-white/70 rounded-xl cursor-pointer mt-4 w-full"
          type="button"
          @click="addInvoiceItem"
          v-if="props.invoice"
        >
          + Add Item
        </button>
      </div>
      <div class="flex justify-between items-center mt-2 mb-2">
        <span class="text-xs text-white/70">Total</span>
        <span class="text-lg font-bold text-white"
          >₦{{ props.invoice?.total?.toLocaleString() }}</span
        >
      </div>
      <div class="flex gap-2 mt-2 justify-between border-t pt-6 items-center border-white/10">
        <div class="flex gap-2 items-center">
          <IconPerson class="size-4" />
          <CustomDropdown
            :options="[
              { label: 'None', value: undefined },
              ...props.clients.map((c) => ({ label: c.name, value: c.id })),
            ]"
            :model-value="props.invoice?.clientId"
            @update:modelValue="
              (val) =>
                updateInvoice(props.invoice.id, { clientId: val === undefined ? undefined : val })
            "
            class="min-w-32"
          />
        </div>

        <div>
          <button
            class="text-xs px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ml-2"
            type="button"
            @click="showDeleteConfirm = true"
          >
            Delete Invoice
          </button>
        </div>
      </div>
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-60 flex items-center justify-center bg-black/60 text-xs"
      >
        <div class="bg-[#18181b] rounded-2xl p-8 shadow-2xl flex flex-col items-center">
          <div class="text-white text-lg font-semibold mb-4">Confirm Deletion</div>
          <div class="text-white/70 mb-6">
            Are you sure you want to delete this invoice? This action cannot be undone.
          </div>
          <div class="flex gap-4">
            <button
              class="px-4 py-2 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600"
              @click="showDeleteConfirm = false"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              @click="handleDeleteInvoice"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
@/index
