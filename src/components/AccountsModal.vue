<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <transition name="bottom-sheet-invoice" appear>
      <div
        v-show="showAccountModal"
        class="sm:rounded-3xl bg-[#18181b] w-full h-full max-h-full flex flex-col relative border border-white/10 sm:w-2xl max-w-2xl sm:h-[50rem] sm:max-h-[90vh] overflow-hidden"
      >
        <div class="flex justify-between items-center px-6 py-4 border-b border-white/10">
          <span class="font-bold text-lg text-white">Account Settings</span>
          <button
            @click="closeAccountModal"
            class="text-white/60 hover:text-white text-xl cursor-pointer"
          >
            <IconX class="size-5" />
          </button>
        </div>
        <div class="flex flex-col gap-10 p-6 overflow-y-auto">
          <!-- Account Section -->
          <section>
            <div class="font-semibold text-sm mb-0.5">Account Information</div>
            <!-- <div class="text-white/60 text-[10px]">Basic details for your account.</div> -->
            <div class="flex gap-2 border-white/20 items-center mt-4">
              <div
                class="flex flex-col items-center justify-center w-10 h-10 border border-white/20 rounded-full cursor-pointer bg-white/5 hover:bg-white/10 font-bold text-white/60 text-sm"
              >
                {{ user?.email?.charAt(0).toUpperCase() }}
              </div>
              <div class="text-white">
                <div class="text-white text-xs">
                  {{ user?.email }}
                </div>
                <div class="flex gap-2 items-center text-[10px]">
                  <span class="text-white/50">Created:</span>

                  <span class="text-white/50">{{
                    formatDate(account.createdAt, 'EEE, dd MMM yyyy')
                  }}</span>
                </div>
              </div>
            </div>
          </section>
          <!-- Companies Section -->
          <section>
            <div class="flex items-center justify-between mb-4">
              <span class="font-semibold text-sm">Companies</span>
              <button
                @click="openAddCompany"
                class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
              >
                Add Company
              </button>
            </div>
            <!-- <div class="text-white/60 text-[10px] mb-4">
              Manage your companies below. You can add, edit, or remove companies as needed.
            </div> -->
            <div
              v-if="companies?.length === 0"
              class="text-white/40 text-xs py-8 flex flex-col items-center gap-2"
            >
              <span>No companies yet.</span>
              <button
                @click="openAddCompany"
                class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
              >
                Add Company
              </button>
            </div>

            <!-- Companies List (limit to 3, show see more if more) -->
            <ul v-else class="flex flex-col gap-2 text-[10px]">
              <li v-for="company in companies?.slice(0, 3)" :key="company.id">
                <CompanyItem
                  @remove-company="deleteCompany(company.id)"
                  :company="company"
                  @edit-company="editCompany(company)"
                />
              </li>
            </ul>
            <div
              class="flex justify-start pt-3 mt-4 border-t border-white/10 border-dashed"
              v-if="(companies?.length ?? 0) - 3 > 0"
            >
              <button
                @click="showAllCompaniesModal = true"
                class="text-[10px] rounded-lg text-white hover:text-white/50 cursor-pointer flex gap-2"
              >
                See {{ (companies?.length ?? 0) - 3 }} more
                {{ (companies?.length ?? 0) - 3 > 1 ? 'companies' : 'company' }}
                <IconArrowRight class="size-4" />
              </button>
            </div>

            <!-- Add/Edit Company Modal -->
            <AddEditCompany
              :showCompanyModal="showCompanyModal"
              :editingCompany="editingCompany"
              :onCompanyLogoChange="onCompanyLogoChange"
              :closeCompanyModal="closeCompanyModal"
            />

            <!-- All Companies Modal -->

            <AllCompanies
              @open-edit-company-modal="editCompany"
              v-model:showAllCompaniesModal="showAllCompaniesModal"
            />
          </section>
          <!-- <section>
            <div>
              <div class="flex items-center justify-between mb-4">
                <span class="font-semibold text-sm">Payment Accounts</span>
                <button
                  @click="openAddPayment"
                  class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                >
                  Add Payment Account
                </button>
              </div>

              <div
                v-if="payments.length === 0"
                class="text-white/40 text-xs py-4 flex flex-col items-center gap-2"
              >
                <span>No payment details yet.</span>
                <button
                  @click="openAddPayment"
                  class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
                >
                  Add Payment Account
                </button>
              </div>
              <ul v-else class="flex flex-col gap-4">
                <li v-for="payment in payments.slice(0, 3)" :key="payment.id">
                  <PaymentAccountItem
                    :editPayment="editPayment"
                    :removePayment="removePayment"
                    :payment="payment"
                  />
                </li>
              </ul>
              <div
                class="flex justify-start pt-3 mt-4 border-t border-white/10 border-dashed"
                v-if="payments.length"
              >
                <button
                  @click="showAllPaymentsModal = true"
                  class="text-[10px] rounded-lg text-white hover:text-white/50 cursor-pointer flex gap-2"
                >
                  See all payment accounts <IconArrowRight class="size-4" />
                </button>
              </div>
            </div>

            <AddEditPayment
              :showPaymentModal="showPaymentModal"
              :editingPayment="editingPayment"
              :paymentForm="paymentForm"
              :closePaymentModal="closePaymentModal"
              :savePayment="savePayment"
            />

            <AllPaymentDetails
              :payments="payments"
              :editPayment="editPayment"
              :removePayment="removePayment"
              v-model:showAllPaymentsModal="showAllPaymentsModal"
            />
          </section> -->
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { currentUser, type Company } from '@/db'
import { from, useObservable } from '@vueuse/rxjs'
import { ref, reactive } from 'vue'
import AllCompanies from './AllCompanies.vue'
import AddEditCompany from './AddEditCompany.vue'
// import AddEditPayment from './AddEditPayment.vue'
// import AllPaymentDetails from './AllPaymentDetails.vue'
import CompanyItem from './CompanyItem.vue'
// import PaymentAccountItem from './PaymentAccountItem.vue'
import { formatDate } from 'date-fns'

import IconArrowRight from './icons/IconArrowRight.vue'
import { liveQuery } from 'dexie'
import { fetchAllCompanies, deleteCompany } from '@/db/companyActions'
import IconX from './icons/IconX.vue'

const emit = defineEmits(['close'])

const user = useObservable(currentUser)

const showAccountModal = ref(true)
function closeAccountModal() {
  showAccountModal.value = false
  setTimeout(() => emit('close'), 300)
}

// Account info (mocked for now)
const account = reactive({
  createdAt: '2024-01-01',
})

const companies = useObservable<Company[]>(from(liveQuery(() => fetchAllCompanies())))

const showAllCompaniesModal = ref(false)
// const showAllPaymentsModal = ref(false)
const showCompanyModal = ref(false)
const editingCompany = ref<Company | undefined>(undefined)

function onCompanyLogoChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      console.log(ev)
      // companyForm.logoUrl = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function openAddCompany() {
  editingCompany.value = undefined
  showCompanyModal.value = true
}

function editCompany(company: Company | undefined) {
  editingCompany.value = company
  showCompanyModal.value = true
}

function closeCompanyModal() {
  showCompanyModal.value = false
  editingCompany.value = undefined
}

// Dummy payments (at least 4)
// const dummyPayments = [
//   { id: 1, bank: 'Bank of America', accountNumber: '123456789', accountName: 'Acme Corp' },
//   { id: 2, bank: 'Chase', accountNumber: '987654321', accountName: 'Globex Inc' },
//   { id: 3, bank: 'Wells Fargo', accountNumber: '555555555', accountName: 'Soylent LLC' },
//   { id: 4, bank: 'Citibank', accountNumber: '111222333', accountName: 'Initech' },
// ]
// const payments = ref([...dummyPayments])
// let nextPaymentId = 5
// const showPaymentModal = ref(false)
// const editingPayment = ref<{
//   id: number
//   bank: string
//   accountNumber: string
//   accountName: string
// } | null>(null)
// const paymentForm = reactive({ bank: '', accountNumber: '', accountName: '' })

// function openAddPayment() {
//   editingPayment.value = null
//   paymentForm.bank = ''
//   paymentForm.accountNumber = ''
//   paymentForm.accountName = ''
//   showPaymentModal.value = true
// }

// function editPayment(payment: {
//   id: number
//   bank: string
//   accountNumber: string
//   accountName: string
// }) {
//   editingPayment.value = payment
//   paymentForm.bank = payment.bank
//   paymentForm.accountNumber = payment.accountNumber
//   paymentForm.accountName = payment.accountName
//   showPaymentModal.value = true
// }

// function savePayment() {
//   if (!paymentForm.bank || !paymentForm.accountNumber || !paymentForm.accountName) return
//   if (editingPayment.value) {
//     const idx = payments.value.findIndex((p) => p.id === editingPayment.value!.id)
//     if (idx !== -1) {
//       payments.value[idx] = { ...editingPayment.value, ...paymentForm }
//     }
//   } else {
//     payments.value.push({ id: nextPaymentId++, ...paymentForm })
//   }
//   closePaymentModal()
// }

// function removePayment(id: number) {
//   payments.value = payments.value.filter((p) => p.id !== id)
// }

// function closePaymentModal() {
//   showPaymentModal.value = false
//   editingPayment.value = null
//   paymentForm.bank = ''
//   paymentForm.accountNumber = ''
//   paymentForm.accountName = ''
// }
</script>

<style>
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
