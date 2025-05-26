<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from 'date-fns'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

import { db } from '@/db'
import type { Invoice, Client } from '@/db'
import { fetchAllInvoices } from '@/db/invoiceActions'
import CustomDropdown from '../components/CustomDropdown.vue'
import InvoiceModal from '../components/InvoiceModal.vue'
import IconPlus from '../components/icons/IconPlus.vue'

async function addInvoice() {
  const response = await db.invoices.add({
    status: 'unpaid',
    items: [{ description: '', quantity: 1, rate: 0 }],
    total: 0,
    issueDate: new Date().toISOString(),
  })
  openInvoiceModal(response)
}

const route = useRoute()
const router = useRouter()

const activeTab = ref<'invoices' | 'clients'>(
  route.query.tab === 'clients' ? 'clients' : 'invoices',
)
const clientFilter = ref<number | 'all'>(route.query.client ? Number(route.query.client) : 'all')
const clientSearch = ref('')

watch([activeTab, clientFilter], ([tab, client]) => {
  const query: any = { ...route.query, tab }
  if (tab === 'invoices') {
    query.client = client !== 'all' ? client : undefined
  } else {
    delete query.client
  }
  router.replace({ query })
})

watch(route, (newRoute) => {
  if (
    newRoute.query.tab &&
    (newRoute.query.tab === 'invoices' || newRoute.query.tab === 'clients')
  ) {
    activeTab.value = newRoute.query.tab as 'invoices' | 'clients'
  }
  if (newRoute.query.client) {
    clientFilter.value = Number(newRoute.query.client)
  } else {
    clientFilter.value = 'all'
  }
})

const invoices = useObservable<Invoice[]>(liveQuery(() => fetchAllInvoices()))
const clients = useObservable<Client[]>(liveQuery(() => db.clients.toArray()))

const filteredInvoices = computed(() => {
  const items = invoices.value || []
  if (clientFilter.value === 'all') return items
  return items.filter((inv) => inv.clientId === clientFilter.value)
})

const filteredClients = computed(() => {
  const items = clients.value || []
  if (!clientSearch.value) return items
  const search = clientSearch.value.toLowerCase()
  return items.filter(
    (c) =>
      c.name.toLowerCase().includes(search) ||
      c.email.toLowerCase().includes(search) ||
      c.phone.toLowerCase().includes(search),
  )
})

const gotoClientInvoice = (client: number) => {
  router.push({ path: '/', query: { tab: 'invoices', client } })
}

const selectedInvoiceId = ref<number | null>(
  route.query.invoice ? Number(route.query.invoice) : null,
)
const showInvoiceModal = ref(false)
const selectedInvoice = computed(
  () => invoices.value?.find((inv) => inv.id === selectedInvoiceId.value) ?? null,
)

// Removed markedItems, editingIdx, editingDescription, deleteMarkedItems, addInvoiceItem

const openInvoiceModal = (invoiceId: number) => {
  selectedInvoiceId.value = invoiceId
  showInvoiceModal.value = true
  router.replace({ query: { ...route.query, invoice: invoiceId } })
}

const closeInvoiceModal = () => {
  showInvoiceModal.value = false
  selectedInvoiceId.value = null
  const query = { ...route.query }
  delete query.invoice
  router.replace({ query })
}

watch(route, (newRoute) => {
  if (newRoute.query.invoice) {
    selectedInvoiceId.value = Number(newRoute.query.invoice)
    showInvoiceModal.value = true
  } else {
    showInvoiceModal.value = false
    selectedInvoiceId.value = null
  }
})


</script>

<template>
  <main class="flex h-full py-20 mx-auto max-w-4xl container">
    <div class="h-full w-full">
      <div class="mb-10 flex justify-between items-center">
        <div class="flex gap-2 items-center">
          <button
            class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer"
            :class="
              activeTab === 'invoices' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'
            "
            @click="activeTab = 'invoices'"
          >
            Invoices
          </button>
          <button
            class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer"
            :class="
              activeTab === 'clients' ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'
            "
            @click="activeTab = 'clients'"
          >
            Clients
          </button>
        </div>
      </div>
      
      <div v-if="activeTab === 'invoices'" class="">
        <div class="flex mb-4 justify-between">
          <div>
            <CustomDropdown
              class="w-48"
              :options="[
                { label: 'All Clients', value: 'all' },
                ...(clients?.map((c) => ({ label: c.name, value: c.id })) ?? []),
              ]"
              v-model="clientFilter"
            />
          </div>

          <button
            @click="addInvoice"
            class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white text-black items-center"
          >
            <IconPlus class="size-3" /> New Invoice
          </button>
        </div>
        <ul class="grid grid-cols-3 gap-4">
          <li
            class="rounded-2xl p-4 flex flex-col gap-2 bg-white/10 shadow-lg h-56 justify-between cursor-pointer"
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            @click="openInvoiceModal(invoice.id)"
          >
            <div class="flex flex-col mb-2">
              <span v-if="invoice.issueDate" class="text-xs text-white/30 mb-4 text-right">
                {{ formatDate(invoice.issueDate, 'EEE, dd MMM yyyy | HH:mm') }}</span
              >
              <div class="flex flex-col gap-1">
                <span class="text-xs text-white">Invoice #{{ invoice.id }} </span>
                <span class="text-xs text-white/30">{{ invoice.items.length }} items</span>
              </div>
            </div>
            <div class="flex justify-between items-center flex-col">
              <div class="flex items-center flex-col gap-2">
                <div class="text-sm text-white">₦{{ invoice.total.toLocaleString() }}</div>
                <div class="text-xs font-normal text-white/30">
                  {{ clients?.find((c) => c.id === invoice.clientId)?.name || 'Unknown Client' }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div v-if="activeTab === 'clients'">
        <div class="mb-4 flex justify-end">
          <input
            v-model="clientSearch"
            placeholder="Search clients..."
            class="rounded-xl px-3 py-3 text-xs bg-white/20 text-white w-full outline-none border-none"
          />
        </div>
        <div>
          <ul class="flex flex-col gap-y-4">
            <li
              class="bg-white/10 rounded-2xl flex justify-between py-5 px-6 cursor-pointer"
              v-for="client in filteredClients"
              :key="client.id"
              @click="gotoClientInvoice(client.id)"
            >
              <div class="">
                <h4 class="text-xs">{{ client.name }}</h4>
              </div>
              <div class="text-xs text-gray-400 flex justify-center items-center">
                <span>50 invoices </span>
                <span class="size-2 rounded-full bg-white mx-4"></span>
                <span>45 paid </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </main>

  <InvoiceModal
    v-if="showInvoiceModal && selectedInvoice"
    :invoice="selectedInvoice"
    :clients="clients || []"
    @close="closeInvoiceModal"
  />
</template>
@/index@/index
