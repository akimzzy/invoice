<script setup lang="ts">
import { ref, toRaw, computed, nextTick } from 'vue'
import IconTrash from './icons/IconTrash.vue'
import IconX from './icons/IconX.vue'
import CustomCheckbox from './CustomCheckbox.vue'
import CustomDropdown from './CustomDropdown.vue'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'
import ClientFormInner from './ClientFormInner.vue'
import ItemForm from './ItemForm.vue'
import { formatDate } from 'date-fns'
import IconPerson from './icons/IconPerson.vue'
import IconPlus from './icons/IconPlus.vue'
import IconShare from './icons/IconShare.vue'
import IconDownload from './icons/IconDownload.vue'
import IconDots from './icons/IconDots.vue'
import IconWhatsApp from './icons/IconWhatsApp.vue'
import IconClipboard from './icons/IconClipboard.vue'
import IconList from './icons/IconList.vue'
import IconGear from './icons/IconGear.vue'
import IconNote from './icons/IconNote.vue'
import html2pdf from 'html2pdf.js'
import InvoiceA4Example from '@/components/InvoiceA4Example.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import NotePanel from '@/components/NotePanel.vue'

import { useRoute, useRouter } from 'vue-router'

import type { Invoice, Client, InvoiceItem } from '@/db'
import { updateInvoiceItems, deleteInvoice, updateInvoice } from '@/db/invoiceActions.ts'

import { useNotification } from '@/composables/useNotification'

const props = defineProps<{ invoice: Invoice; clients: Client[] }>()
const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

const { notify } = useNotification()

const tabs = computed(() => [
  { label: 'Items', query: 'items', icon: IconList, total: props.invoice?.items?.length },
  { label: 'Note', query: 'note', icon: IconNote },
  { label: 'Settings', query: 'settings', icon: IconGear },
])

const invoiceTab = computed(() => route.query['invoice-tab'])
const isItemsTab = computed(() => invoiceTab.value === 'items' || !invoiceTab.value)
const isNoteTab = computed(() => invoiceTab.value === 'note')
const isSettingsTab = computed(() => invoiceTab.value === 'settings')

const markedItems = ref<number[]>([])
const editingIdx = ref<number | null>(null)
const showDeleteConfirm = ref(false)
const showMobileActions = ref(false)

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
  const deletedCount = markedItems.value.length
  items = items.filter(
    (_item: { description: string; quantity: number; rate: number }, idx: number) =>
      !markedItems.value.includes(idx),
  )

  if (items.length === 0) {
    items = [{ description: '', quantity: 1, rate: 0 }]
  }

  await updateInvoiceItems(props.invoice.id, items)
  markedItems.value = []
  selectMode.value = false
  if (deletedCount > 0) {
    notify({
      message: `${deletedCount} item${deletedCount > 1 ? 's' : ''} deleted from invoice`,
      type: 'success',
    })
  }
}

const focusLastItem = ref<boolean>(false)

async function addInvoiceItem() {
  if (!props.invoice) return

  try {
    const { items } = toRaw(props.invoice)

    await updateInvoiceItems(props.invoice.id, [
      ...items,
      { description: '', quantity: 1, rate: 0 },
    ])
    focusLastItem.value = true
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
    notify({ message: 'Failed to delete invoice', type: 'error' })
  }
}

const clientModal = ref(false)
const selectMode = ref(false)

const pdfRef = ref<HTMLElement | null>(null)

async function generatePDF() {
  await nextTick()
  const element = pdfRef.value
  if (!element) return
  const options = {
    margin: [0, 0, 0, 0],
    filename: `invoice-${props.invoice?.code || 'download'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      logging: false,
      useCORS: true,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    },
  }
  try {
    const worker = html2pdf().set(options)
    await worker.from(element).save()
  } catch (error) {
    console.error('Failed to generate PDF:', error)
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <transition name="bottom-sheet-invoice" appear>
      <div
        class="sm:rounded-3xl bg-[#18181b] w-full h-full max-h-full flex flex-col relative border border-white/10 sm:w-2xl max-w-2xl sm:h-[50rem] sm:max-h-[90vh] overflow-hidden"
      >
        <div
          class="rounded-t-3xl text-white/30 border-b border-b-white/10 w-full bg-[#18181b] flex items-center justify-between"
        >
          <div class="flex p-4 items-center gap-2">
            <div class="text-lg font-semibold text-white">Invoice #{{ props.invoice?.code }}</div>
            <span class="text-[10px]">
              {{ formatDate(props.invoice?.issueDate, 'EEE, dd MMM yyyy | HH:mm') }}
            </span>
          </div>
          <button
            class="text-[10px] text-white cursor-pointer hover:text-white/50 flex place-items-center p-4 sm:p-4"
            @click="() => emit('close')"
          >
            <IconX class="size-5" />
          </button>
        </div>

        <div class="p-4 pt-0 flex-1 flex flex-col overflow-y-auto">
          <div class="flex-1 flex flex-col min-h-0">
            <div class="flex items-center justify-between mb-4">
              <div class="text-xs flex gap-2">
                <button
                  v-for="tab in tabs"
                  :key="tab.label"
                  class="text-xs py-1 px-2 rounded-b-lg cursor-pointer border border-t-0 flex"
                  :class="
                    (invoiceTab || 'items') === tab.query
                      ? 'bg-white text-black border-transparent'
                      : 'text-white/60 bg-white/5 border-transparent'
                  "
                  @click="
                    () => {
                      focusLastItem = false
                      router.push({ query: { ...route.query, 'invoice-tab': tab.query } })
                    }
                  "
                >
                  <component v-if="tab.icon" :is="tab.icon" class="size-3 mr-2" />
                  {{ tab.label }}
                  <span class="font-black ml-2" v-if="tab.total">{{ tab.total }}</span>
                </button>
              </div>
            </div>
            <div class="flex items-center justify-end" v-if="isItemsTab">
              <div class="flex items-center gap-2">
                <button
                  v-if="selectMode"
                  class="text-xs px-2 py-1 rounded disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                  :disabled="!markedItems.length"
                  @click="deleteMarkedItems"
                  type="button"
                >
                  <IconTrash class="size-4 text-white" />
                </button>
                <button
                  @click="
                    () => {
                      selectMode = !selectMode
                      markedItems = []
                    }
                  "
                  class="text-[10px] p-1 bg-white/10 rounded-lg px-2 cursor-pointer"
                >
                  {{ selectMode ? 'Cancel' : 'Select' }}
                </button>
              </div>
            </div>
            <SettingsPanel
              v-if="isSettingsTab"
              :invoice="props.invoice"
              @update-invoice="updateInvoice"
            />
            <NotePanel
              v-else-if="isNoteTab"
              :note="props.invoice.note || ''"
              @update:note="(val: string) => updateInvoice(props.invoice.id, { note: val })"
            />

            <ul
              class="flex flex-col divide-y mt-2 sm:mt-4 divide-white/10 overflow-y-auto flex-1"
              v-else-if="isItemsTab"
            >
              <li
                v-for="(item, idx) in props.invoice?.items"
                :key="item.description + idx"
                class="flex text-xs text-white/90 items-center gap-2 relative group flex-wrap"
                @mouseenter="editingIdx = idx"
                @mouseleave="editingIdx = null"
              >
                <CustomCheckbox
                  v-if="selectMode"
                  :model-value="markedItems.includes(idx)"
                  @update:model-value="(checked) => handleCheckbox(checked, idx)"
                  :disabled="!props.invoice"
                />
                <span
                  v-else
                  class="text-right text-[10px] inline-flex items-center min-h-5 min-w-5 h-full"
                >
                  {{ idx + 1 }}.
                </span>
                <div class="flex flex-col flex-1 justify-center min-w-0">
                  <ItemForm
                    :key="idx"
                    :item="item"
                    :hovered="editingIdx === idx"
                    :focus-description="focusLastItem && idx + 1 === props.invoice?.items.length"
                    @update:item="(val) => handleItemUpdate(val, idx)"
                  />
                </div>
              </li>
            </ul>
            <div class="flex justify-center">
              <button
                class="text-white cursor-pointer flex gap-2 justify-center items-center text-[10px] py-2 px-4 rounded-xl bg-white/5 border-transparent border"
                type="button"
                @click="addInvoiceItem"
                v-if="props.invoice && isItemsTab"
              >
                <IconPlus class="size-2" /> Add Item
              </button>
            </div>
          </div>
          <div class="flex justify-between items-center mt-4" v-if="props.invoice && isItemsTab">
            <span class="text-xs text-white/70">Total</span>
            <span class="text-md font-bold text-white"
              >₦{{ props.invoice?.total?.toLocaleString() }}</span
            >
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex gap-2 p-6 pb-10 sm:pb-6 justify-between border-t items-center border-white/10"
        >
          <div class="flex gap-4 items-center w-full sm:w-auto">
            <CustomDropdown
              :options="[
                { label: 'None', value: undefined },
                { label: '+ Add client', value: undefined, onClick: () => (clientModal = true) },
                ...props.clients.map((c) => ({ label: c.name, value: c.id })),
              ]"
              :model-value="props.invoice?.clientId"
              @update:modelValue="
                (val) =>
                  updateInvoice(props.invoice.id, {
                    clientId: val === undefined ? undefined : String(val),
                  })
              "
            >
              <template #selected-icon>
                <IconPerson class="size-3" />
              </template>
            </CustomDropdown>
          </div>
          <div class="w-full sm:w-auto flex justify-end gap-2">
            <button
              class="text-xs size-8 rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer flex justify-center items-center p-2 sm:hidden"
              type="button"
              @click="showMobileActions = true"
            >
              <IconDots class="size-full rotate-90" />
            </button>
            <button
              class="text-xs size-8 rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer justify-center items-center p-2 hidden sm:flex"
              type="button"
              @click="generatePDF"
            >
              <IconDownload class="size-full" />
            </button>
            <button
              class="text-xs size-8 rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer hidden sm:flex justify-center items-center p-2"
              type="button"
            >
              <IconShare class="size-full" />
            </button>
            <button
              class="text-xs size-8 rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer hidden sm:flex justify-center items-center p-2"
              type="button"
              @click="showDeleteConfirm = true"
            >
              <IconTrash class="size-full" />
            </button>
          </div>
        </div>

        <div
          v-if="clientModal"
          class="absolute h-full w-full flex items-end top-0 left-0 bg-black/60 rounded-3xl"
        >
          <transition name="bottom-sheet" appear>
            <div v-show="clientModal" class="w-full">
              <ClientFormInner
                class="border-none pb-20"
                @close="() => (clientModal = false)"
                @saved="
                  (id) => {
                    updateInvoice(props.invoice.id, { clientId: id })
                  }
                "
              />
            </div>
          </transition>
        </div>

        <ConfirmDeleteModal
          :visible="showDeleteConfirm"
          @confirm="handleDeleteInvoice"
          @cancel="showDeleteConfirm = false"
        />

        <div
          v-if="showMobileActions"
          @click.self="showMobileActions = false"
          class="absolute h-full w-full flex items-end top-0 left-0 bg-black/60 rounded-3xl sm:hidden"
        >
          <transition name="bottom-sheet" appear>
            <div
              v-show="showMobileActions"
              class="w-full bg-[#18181b] rounded-t-3xl p-6 pt-4 pb-20"
            >
              <div class="flex justify-end mb-4">
                <button
                  class="text-white/50 hover:text-white/60 text-2xl cursor-pointer p-2 size-8"
                  @click="showMobileActions = false"
                >
                  <IconX class="size-full" />
                </button>
              </div>
              <div class="flex flex-col gap-4">
                <button
                  class="text-xs w-full rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer flex items-center gap-2 p-3"
                  type="button"
                  @click="
                    () => {
                      generatePDF()
                      showMobileActions = false
                    }
                  "
                >
                  <IconDownload class="size-4" />
                  <span>Download Invoice</span>
                </button>

                <button
                  class="text-xs w-full rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer flex items-center gap-2 p-3"
                  type="button"
                >
                  <IconClipboard class="size-4" />
                  <span>Copy URL</span>
                </button>
                <button
                  class="text-xs w-full rounded-lg bg-white/20 text-white hover:bg-white/40 cursor-pointer flex items-center gap-2 p-3"
                  type="button"
                >
                  <IconWhatsApp class="size-4" />
                  <span>Send to Client</span>
                </button>
                <button
                  class="text-xs w-full rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer flex items-center gap-2 p-3"
                  type="button"
                  @click="
                    () => {
                      showDeleteConfirm = true
                      showMobileActions = false
                    }
                  "
                >
                  <IconTrash class="size-4" />
                  <span>Delete Invoice</span>
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </transition>
    <!-- Hidden PDF rendering area -->
    <div style="position: absolute; left: -9999px; top: 0; width: 0; height: 0; overflow: hidden">
      <div ref="pdfRef">
        <InvoiceA4Example :invoice="props.invoice" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
.bottom-sheet-enter-to,
.bottom-sheet-leave-from {
  opacity: 1;
  transform: translateY(0);
}

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
