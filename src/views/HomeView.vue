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
import CustomDropdown from '../components/CustomDropdown.vue'
import IconPlus from '../components/icons/IconPlus.vue'
import IconWhatsApp from '../components/icons/IconWhatsApp.vue'
import IconMail from '../components/icons/IconMail.vue'
import EmptyState from '../components/EmptyState.vue'
import ClientFormModal from '../components/ClientFormModal.vue'
import IconPerson from '../components/icons/IconPerson.vue'
import IconArrowRight from '../components/icons/IconArrowRight.vue'

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
      (c.email?.toLowerCase() || '').includes(search) ||
      (c.phone?.toLowerCase() || '').includes(search),
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
const showClientModal = ref(false)
const editingClient = ref<Client | null>(null)

function openAddClientModal() {
  editingClient.value = null
  showClientModal.value = true
}

function openEditClientModal(client: Client) {
  editingClient.value = client
  showClientModal.value = true
}

function handleClientModalSaved(id: number) {
  if (id) {
    showClientModal.value = false
    editingClient.value = null
  }
}

function getInvoiceCount(clientId: number) {
  return invoices.value?.filter((inv) => inv.clientId === clientId).length
}
</script>

<template>
  <main class="flex h-full py-6 px-2 sm:py-10 sm:px-6 mx-auto max-w-7xl container">
    <div class="h-full w-full flex flex-col overflow-hidden">
      <div class="mb-10 flex justify-between items-center">
        <div class="flex gap-2 items-center">
          <button
            class="px-4 py-2 rounded-lg font-bold focus:outline-none text-xs cursor-pointer"
            :class="
              activeTab === 'invoices' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/40'
            "
            @click="activeTab = 'invoices'"
          >
            Invoices
            <span class="font-extrabold text-white/50">
              {{ invoices?.length }}
            </span>
          </button>
          <button
            class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer font-bold"
            :class="
              activeTab === 'clients' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/40'
            "
            @click="activeTab = 'clients'"
          >
            Clients
            <span class="font-extrabold text-white/50">
              {{ clients?.length }}
            </span>
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'invoices'" class="flex flex-col h-full">
        <div class="flex mb-4 justify-between items-center" v-if="invoices?.length">
          <div>
            <CustomDropdown
              class="w-48"
              :options="[
                { label: 'All Clients', value: 'all' },
                ...(clients?.map((c) => ({ label: c.name, value: c.id })) ?? []),
              ]"
              v-model="clientFilter"
            >
              <template #selected-icon>
                <IconPerson class="size-3" />
              </template>
            </CustomDropdown>
          </div>

          <button
            @click="addInvoice"
            class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white/15 text-white border border-white/10 items-center"
          >
            <IconPlus class="size-2" /> New Invoice
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
              <IconPlus class="size-2" />
              Add Invoice
            </button>
          </template>
        </EmptyState>

        <div v-else class="flex-1">
          <div class="h-full overflow-y-auto" style="max-height: 90vh">
            <ul
              class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-4 rounded-2xl pb-44"
            >
              <li
                class="rounded-2xl flex cursor-pointer p-4 border bg-white/6 border-white/15 h-max"
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
      </div>

      <div v-if="activeTab === 'clients'" class="flex flex-col h-full">
        <div class="flex mb-4 justify-between items-center" v-if="filteredClients.length">
          <div></div>
          <button
            @click="openAddClientModal"
            class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white/15 text-white border border-white/10 items-center"
          >
            <IconPlus class="size-2" /> Add Client
          </button>
        </div>
        <EmptyState
          v-if="filteredClients.length === 0"
          message="No clients yet."
          @add="openAddClientModal"
          class="mt-20"
        >
          <template #button>
            <button
              @click="openAddClientModal"
              class="px-4 py-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white/15 text-white border border-white/10 items-center hover:bg-white/20"
            >
              <IconPlus class="size-2" />
              Add Client
            </button>
          </template>
        </EmptyState>
        <div v-else class="flex-1">
          <div class="h-full overflow-y-auto" style="max-height: 90vh">
            <ul class="flex flex-col gap-y-2 sm:gap-y-4 pb-44">
              <li
                class="bg-white/10 rounded-2xl py-5 px-6 cursor-pointer"
                v-for="client in filteredClients"
                :key="client.id"
                @click="openEditClientModal(client)"
              >
                <div class="flex justify-between">
                  <span class="text-xs">
                    {{ client.name }}
                  </span>
                  <div class="text-xs text-gray-400 flex justify-center items-center">
                    <button
                      class="cursor-pointer flex gap-1 hover:text-white transition-colors duration-200"
                      @click.stop="gotoClientInvoice(client.id)"
                    >
                      {{ getInvoiceCount(client.id) }} invoices <IconArrowRight class="size-4" />
                    </button>
                  </div>
                </div>
                <div
                  class="text-xs text-white/50 flex gap-4 mt-2"
                  v-if="client.email || client.phone"
                >
                  <span class="flex gap-2 items-center" v-if="client.email">
                    <IconMail class="size-3" /> {{ client.email }}</span
                  >
                  <span v-if="client.phone" class="flex gap-2 items-center"
                    ><IconWhatsApp class="size-3" /> {{ client.phone }}</span
                  >
                </div>
              </li>
            </ul>
          </div>
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
  <ClientFormModal
    v-if="showClientModal"
    :client="editingClient"
    @close="showClientModal = false"
    @saved="handleClientModalSaved"
  />
</template>
