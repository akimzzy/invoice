<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from 'date-fns'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'
import type { DXCUserInteraction } from 'dexie-cloud-addon'

import { db, currentUser, logout, login } from '@/db'
import type { Invoice, Client } from '@/db'
import { fetchAllInvoices, createInvoice } from '@/db/invoiceActions'
import InvoiceModal from '../components/InvoiceModal.vue'
import CustomDropdown from '../components/CustomDropdown.vue'
import IconPlus from '../components/icons/IconPlus.vue'
import IconWhatsApp from '../components/icons/IconWhatsApp.vue'
import IconMail from '../components/icons/IconMail.vue'
import EmptyState from '../components/EmptyState.vue'
import ClientFormModal from '../components/ClientFormModal.vue'
import LoginModal from '../components/LoginModal.vue'
import IconPerson from '../components/icons/IconPerson.vue'
import IconArrowRight from '../components/icons/IconArrowRight.vue'
import IconNotification from '../components/icons/IconNotification.vue'
import IconDropdown from '../components/IconDropdown.vue'
import IconLogout from '../components/icons/IconLogout.vue'
import AccountsModal from '../components/AccountsModal.vue'

const dexieObserver = useObservable(db.cloud.userInteraction)

async function addInvoice() {
  const response = await createInvoice({
    status: 'unpaid',
    items: [{ description: '', quantity: 1, rate: 0 }],
    total: 0,
    issueDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
  })

  openInvoiceModal(response)
}

const route = useRoute()
const router = useRouter()

const activeTab = computed<'invoices' | 'clients'>(() =>
  route.query.tab === 'clients' ? 'clients' : 'invoices',
)
// check it the key 'account' is in the query
const accountSettings = computed<boolean>(() => 'account' in route.query)

function changeTab(tab: 'invoices' | 'clients') {
  const query = { ...route.query, tab, client: undefined, invoice: undefined }
  router.push({ query })
}

const clientFilter = computed<string>(() =>
  route.query.client ? String(route.query.client) : 'all',
)

function filterByCLient(client: string | number | undefined) {
  const query = { ...route.query, tab: 'invoice', client, invoice: undefined }
  router.push({ query })
}
const clientSearch = ref('')

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

const gotoClientInvoice = (client: string) => {
  const query: Record<string, string | undefined> = { ...route.query, tab: 'invoices', client }
  router.push({ path: '/', query })
}

const selectedInvoiceId = ref<string | null>(
  route.query.invoice ? String(route.query.invoice) : null,
)
const showInvoiceModal = ref(false)
const selectedInvoice = computed(
  () => invoices.value?.find((inv) => inv.id === selectedInvoiceId.value) ?? null,
)

const openInvoiceModal = (invoiceId: string) => {
  selectedInvoiceId.value = invoiceId
  showInvoiceModal.value = true
  router.replace({ query: { ...route.query, invoice: invoiceId } })
}

const closeInvoiceModal = () => {
  showInvoiceModal.value = false
  selectedInvoiceId.value = null
  const query = { ...route.query }
  delete query.invoice
  delete query['invoice-tab']
  router.replace({ query })
}

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

function getInvoiceCount(clientId: string) {
  return invoices.value?.filter((inv) => inv.clientId === clientId).length
}

onMounted(() => {
  if (selectedInvoiceId.value) {
    showInvoiceModal.value = true
  }
})

const user = useObservable(currentUser)
const isAuthenticated = computed(
  () => user.value && user.value.email && user.value.email !== 'unauthorized',
)

const showLoginModal = ref(false)

function closeAccountsModal() {
  router.push({ query: { ...route.query, account: undefined } })
}
function handleUserDropdown(val: string) {
  if (val === 'logout') {
    logout()
  } else if (val === 'account') {
    router.push({ query: { ...route.query, account: null } })
  }
}
</script>

<template>
  <main class="flex h-full py-6 px-2 sm:py-10 sm:px-6 mx-auto max-w-5xl container">
    <div class="h-full w-full flex flex-col overflow-hidden">
      <div class="mb-10 flex justify-between items-center">
        <div class="flex gap-2 items-center">
          <button
            class="px-3 py-2 rounded-lg focus:outline-none text-xs cursor-pointer"
            :class="activeTab === 'invoices' ? 'bg-white text-black' : 'bg-white/10 text-white/40'"
            @click="changeTab('invoices')"
          >
            Invoices
            <span class="font-extrabold ml-1">
              {{ invoices?.length }}
            </span>
          </button>
          <button
            class="px-3 py-2 rounded-lg focus:outline-none text-xs cursor-pointer"
            :class="
              activeTab === 'clients' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/40'
            "
            @click="changeTab('clients')"
          >
            Clients
            <span class="font-extrabold ml-1">
              {{ clients?.length }}
            </span>
          </button>
        </div>
        <div class="flex justify-center text-xs gap-2 items-center">
          <button
            class="cursor-pointer size-8 rounded-full bg-white/20 flex justify-center items-center"
            v-if="isAuthenticated"
          >
            <IconNotification class="size-4 text-white" />
          </button>
          <IconDropdown
            v-if="isAuthenticated"
            :options="[
              { label: 'Account', value: 'account', icon: IconPerson, subText: user?.email },
              { label: 'Logout', value: 'logout', icon: IconLogout },
            ]"
            @select="handleUserDropdown"
          >
          </IconDropdown>
          <button
            @click="
              () => {
                login()
                showLoginModal = true
              }
            "
            v-else
            class="cursor-pointer bg-white text-black p-2 px-4 rounded-lg"
          >
            Login
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'invoices'" class="flex flex-col h-full">
        <div class="flex mb-4 justify-between items-center" v-if="invoices?.length">
          <div>
            <CustomDropdown
              :options="[
                { label: 'All Clients', value: 'all' },
                ...(clients?.map((c) => ({ label: c.name, value: c.id })) ?? []),
              ]"
              :value="clientFilter"
              @on-change="filterByCLient"
            >
              <template #selected-icon>
                <IconPerson class="size-3" />
              </template>
            </CustomDropdown>
          </div>

          <button
            @click="addInvoice"
            class="p-2 rounded-lg focus:outline-none text-xs cursor-pointer flex gap-2 bg-white/15 text-white border border-white/10 items-center"
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
                class="rounded-xl flex cursor-pointer p-4 border bg-white/6 border-white/15 h-max"
                v-for="invoice in filteredInvoices"
                :key="invoice.id"
                @click="openInvoiceModal(invoice.id)"
              >
                <div class="flex flex-col flex-1">
                  <div class="flex">
                    <div class="flex gap-3 items-center flex-1">
                      <span class="text-xs text-white font-bold">Invoice #{{ invoice.code }} </span>

                      <span class="text-[10px] text-white/30"
                        >{{ invoice.items.length }} item{{
                          invoice.items.length > 1 ? 's' : ''
                        }}</span
                      >
                    </div>
                    <div class="flex justify-between items-center flex-col">
                      <div class="flex items-center flex-col gap-2">
                        <div class="text-xs text-white font-bold">
                          ₦{{ invoice.total.toLocaleString() }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-between border-white/10 text-[10px] mt-2">
                    <span v-if="invoice.issueDate" class="text-white/30 text-center">
                      {{ formatDate(invoice.issueDate, 'EEE, dd MMM yyyy') }}
                    </span>
                    <span class="text-white/30 text-center">
                      {{ clients?.find((c) => c.id === invoice.clientId)?.name || '' }}
                    </span>
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

  <AccountsModal v-if="accountSettings" @close="closeAccountsModal" />
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
  <LoginModal
    v-if="showLoginModal"
    @close="showLoginModal = false"
    :is-authenticated="isAuthenticated"
    :observer="dexieObserver as DXCUserInteraction"
  />
</template>
