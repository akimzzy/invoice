<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from 'date-fns'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import { db } from '@/db'
import type { Invoice, Client } from '@/db'
import { fetchAllInvoices } from '@/db/invoiceActions'
import InvoiceModal from '../components/InvoiceModal.vue'
// import CustomDropdown from '../components/CustomDropdown.vue'
import IconPlus from '../components/icons/IconPlus.vue'
import EmptyState from '../components/EmptyState.vue'

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
  const query: Record<string, string | undefined> = { ...route.query, tab }
  if (tab === 'invoices') {
    query.client = client !== 'all' ? String(client) : undefined
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

const invoices = useObservable<Invoice[]>(from(liveQuery(() => fetchAllInvoices())))
const clients = useObservable<Client[]>(from(liveQuery(() => db.clients.toArray())))

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
  <main class="flex h-full py-6 px-2 sm:py-10 sm:px-6 mx-auto max-w-7xl container">
    <div class="h-full w-full flex flex-col overflow-hidden">
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
            <span class="font-extrabold text-white/50">
              {{ filteredInvoices.length }}
            </span>
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

      <div v-if="activeTab === 'invoices'" class="flex flex-col h-full">
        <div class="flex mb-4 justify-between" v-if="filteredInvoices.length">
          <div>
            <!-- <CustomDropdown
              class="w-48"
              :options="[
                { label: 'All Clients', value: 'all' },
                ...(clients?.map((c) => ({ label: c.name, value: c.id })) ?? []),
              ]"
              v-model="clientFilter"
            /> -->
          </div>

          <button
            @click="addInvoice"
            class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white/15 text-white border border-white/10 items-center"
          >
            <IconPlus class="size-3" /> New Invoice
          </button>
        </div>
        <EmptyState
          v-if="filteredInvoices.length === 0"
          message="No invoices yet."
          @add="addInvoice"
          class="mt-20"
        >
          <template #button>
            <button
              @click="addInvoice"
              class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white/15 *: text-white border border-white/10 items-center hover:bg-white/20"
            >
              <IconPlus class="size-3" />
              Add Invoice
            </button>
          </template>
        </EmptyState>

        <div v-else class="flex-1">
          <ul
            class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-4 h-full overflow-y-auto rounded-2xl pb-44"
            style="max-height: 90vh"
          >
            <li
              class="rounded-2xl flex cursor-pointer p-4 border bg-white/6 border-white/15"
              v-for="invoice in filteredInvoices"
              :key="invoice.id"
              @click="openInvoiceModal(invoice.id)"
            >
              <div class="flex flex-col flex-1">
                <div class="flex">
                  <div class="flex gap-3 items-center flex-1">
                    <span class="text-sm text-white font-bold">Invoice #{{ invoice.id }} </span>

                    <span class="text-xs text-white/30"
                      >{{ invoice.items.length }} item{{
                        invoice.items.length > 1 ? 's' : ''
                      }}</span
                    >
                  </div>
                  <div class="flex justify-between items-center flex-col">
                    <div class="flex items-center flex-col gap-2">
                      <div class="text-sm text-white font-bold">
                        ₦{{ invoice.total.toLocaleString() }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="flex justify-between border-white/10 text-[10px] mt-2">
                  <span v-if="invoice.issueDate" class="text-white/30 text-center">
                    {{ formatDate(invoice.issueDate, 'EEE, dd MMM yyyy') }}</span
                  >
                  <span class="text-white/30 text-center">
                    {{ clients?.find((c) => c.id === invoice.clientId)?.name || '' }}</span
                  >
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="activeTab === 'clients'">
        <div class="mb-4 flex justify-end" v-if="filteredClients.length > 0">
          <input
            v-model="clientSearch"
            placeholder="Search clients..."
            class="rounded-xl px-3 py-3 text-xs bg-white/20 text-white w-full outline-none border-none"
          />
        </div>
        <EmptyState
          v-if="filteredClients.length === 0"
          message="No clients yet."
          @add="$emit ? $emit('addClient') : null"
          class="mt-20"
        >
          <template #button>
            <button
              @click="$emit ? $emit('addClient') : null"
              class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white/15 *: text-white border border-white/10 items-center hover:bg-white/20"
            >
              <IconPlus class="size-3" />

              Add Client
            </button>
          </template>
        </EmptyState>
        <div v-else>
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
