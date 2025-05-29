<script setup lang="ts">
import { ref, toRaw } from 'vue'
import IconTrash from './icons/IconTrash.vue'
import IconX from './icons/IconX.vue'
import CustomCheckbox from './CustomCheckbox.vue'
import CustomDropdown from './CustomDropdown.vue'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'
import ItemForm from './ItemForm.vue'
import { formatDate } from 'date-fns'
import IconPerson from './icons/IconPerson.vue'

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
      class="sm:rounded-3xl bg-[#18181b] shadow-2xl w-full max-w-2xl h-full max-h-full flex flex-col relative border border-white/10 sm:w-2xl sm:h-[50rem] sm:max-h-[90vh]"
    >
      <div
        class="rounded-t-3xl text-white/30 border-b border-b-white/10 w-full bg-[#18181b] flex items-center justify-between"
      >
        <div class="flex p-5 items-center gap-2">
          <div class="text-lg font-semibold text-white">Invoice #{{ props.invoice?.id }}</div>
          <span class="text-[10px]">
            {{ formatDate(props.invoice?.issueDate, 'EEE, dd MMM yyyy | HH:mm') }}
          </span>
        </div>
        <button
          class="text-xs text-white cursor-pointer hover:text-white/50 flex place-items-center p-5 sm:p-6"
          @click="() => emit('close')"
        >
          <IconX class="size-4" />
        </button>
      </div>

      <div class="p-6 flex-1 flex flex-col overflow-y-auto">
        <div class="mb-2 flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between">
            <div class="text-xs text-white/70">Items ({{ props.invoice?.items?.length }})</div>
            <button
              class="text-xs px-2 py-1 rounded disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
              :disabled="!markedItems.length"
              @click="deleteMarkedItems"
              type="button"
            >
              <IconTrash class="size-4 text-white" />
            </button>
          </div>
          <ul class="flex flex-col divide-y mt-2 sm:mt-4 divide-white/10 overflow-y-auto flex-1">
            <li
              v-for="(item, idx) in props.invoice?.items"
              :key="item.description + idx"
              class="flex text-xs text-white/90 items-center gap-2 relative group flex-wrap"
              @mouseenter="editingIdx = idx"
              @mouseleave="editingIdx = null"
            >
              <CustomCheckbox
                :model-value="markedItems.includes(idx)"
                @update:model-value="(checked) => handleCheckbox(checked, idx)"
                :disabled="!props.invoice"
              />
              <div class="flex flex-col flex-1 justify-center min-w-0">
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
        <div class="flex justify-between items-center mt-4">
          <span class="text-xs text-white/70">Total</span>
          <span class="text-lg font-bold text-white"
            >₦{{ props.invoice?.total?.toLocaleString() }}</span
          >
        </div>
      </div>
      <div class="flex gap-2 p-6 pb-10 sm:pb-6 justify-between border-t items-center border-white/10">
        <div class="flex gap-2 items-center w-full sm:w-auto">
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
          >
            <template #selected-icon>
              <IconPerson class="size-3" />
            </template>
          </CustomDropdown>
        </div>
        <div class="w-full sm:w-auto flex justify-end">
          <button
            class="text-xs px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 ml-2 cursor-pointer w-max"
            type="button"
            @click="showDeleteConfirm = true"
          >
            Delete Invoice
          </button>
        </div>
      </div>

      <ConfirmDeleteModal
        :visible="showDeleteConfirm"
        @confirm="handleDeleteInvoice"
        @cancel="showDeleteConfirm = false"
      />
    </div>
  </div>
</template>
