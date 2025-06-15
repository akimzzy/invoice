<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div
      class="sm:rounded-3xl bg-[#18181b] w-full h-full max-h-full flex flex-col relative border border-white/10 sm:w-2xl max-w-2xl sm:h-[50rem] sm:max-h-[90vh] overflow-hidden"
    >
      <div class="flex justify-between items-center px-6 py-4 border-b border-white/10">
        <span class="font-bold text-lg text-white">Account Settings</span>
        <button @click="$emit('close')" class="text-white/60 hover:text-white text-xl">
          &times;
        </button>
      </div>
      <div class="flex flex-col gap-6 p-6 overflow-y-auto" style="max-height: 70vh">
        <!-- Account Section -->
        <section>
          <div class="font-semibold text-sm mb-1">Account Information</div>
          <div class="text-white/60 text-[10px] mb-2">Basic details for your account.</div>
          <div class="flex flex-col gap-2">
            <input
              class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
              placeholder="Email"
              v-model="account.email"
            />
            <!-- <input
              class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
              placeholder="Phone"
              v-model="account.phone"
            /> -->
          </div>
        </section>
        <!-- Companies Section -->
        <section>
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-sm">Companies</span>
            <button
              @click="openAddCompany"
              class="text-xs px-2 py-1 rounded bg-white/20 text-white hover:bg-white/40"
            >
              Add Company
            </button>
          </div>
          <div
            v-if="companies.length === 0"
            class="text-white/40 text-xs py-8 flex flex-col items-center gap-2"
          >
            <span>No companies yet.</span>
            <button
              @click="openAddCompany"
              class="text-xs px-2 py-1 rounded bg-white/20 text-white hover:bg-white/40"
            >
              Add Company
            </button>
          </div>
          <ul v-else class="flex flex-col gap-4 mt-4">
            <li
              v-for="company in companies"
              :key="company.id"
              class="flex justify-between items-center mt-2"
            >
              <div class="flex gap-2 items-center">
                <div
                  class="flex flex-col items-center justify-center w-10 h-10 border border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 font-bold text-white/60 text-xl"
                >
                  <span>{{ company.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <h3 class="text-xs mb-1">{{ company.name }}</h3>
                  <div class="flex gap-2 items-center">
                    <span class="text-white/50">{{ company.phone }}</span>
                    <span
                      v-if="company.phone && company.email"
                      class="size-1 bg-white/30 rounded-full inline-block"
                    ></span>
                    <span class="text-white/50">{{ company.email }}</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editCompany(company)"
                  class="p-1 bg-white/20 rounded-lg px-2 cursor-pointer hover:bg-white/35 text-xs text-white"
                >
                  Edit
                </button>
                <button
                  @click="removeCompany(company.id)"
                  class="p-1 bg-red-600 rounded-lg px-2 cursor-pointer hover:bg-red-700 text-xs text-white"
                >
                  Remove
                </button>
              </div>
            </li>
          </ul>
          <!-- Add/Edit Company Modal -->
          <div
            v-if="showCompanyModal"
            class="absolute inset-0 z-60 flex items-end justify-center bg-black/60"
          >
            <div class="bg-[#18181b] rounded-2xl shadow-xl w-full p-6 flex flex-col gap-4 pb-20">
              <div class="font-bold text-lg text-white mb-2">
                {{ editingCompany ? 'Edit Company' : 'Add Company' }}
              </div>
              <input
                class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
                placeholder="Company Name"
                v-model="companyForm.name"
              />
              <input
                class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
                placeholder="Email"
                v-model="companyForm.email"
              />
              <input
                class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
                placeholder="Phone"
                v-model="companyForm.phone"
              />
              <div class="flex gap-2 justify-end mt-2">
                <button
                  @click="closeCompanyModal"
                  class="text-xs px-2 py-1 rounded bg-white/20 text-white hover:bg-white/40"
                >
                  Cancel
                </button>
                <button
                  @click="saveCompany"
                  class="text-xs px-2 py-1 rounded bg-white/40 text-white hover:bg-white/60"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>
        <!-- Payment Section -->
        <section>
          <div class="font-semibold text-sm mb-1">Payment</div>
          <div class="text-white/60 text-[10px] mb-2">
            Provide your payment details here to receive payments from your client.
          </div>
          <div class="flex flex-col gap-2">
            <input
              class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
              placeholder="Bank Name"
              v-model="account.paymentBank"
            />
            <input
              class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
              placeholder="Account Number"
              v-model="account.paymentAccount"
            />
            <input
              class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
              placeholder="Account Name"
              v-model="account.name"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const emit = defineEmits(['close'])

// Account info (mocked for now)
const account = reactive({
  name: '',
  email: '',
  phone: '',
  paymentBank: '',
  paymentAccount: '',
})

// Companies state
const companies = ref<{ id: number; name: string; email: string; phone: string }[]>([])
let nextCompanyId = 1

const showCompanyModal = ref(false)
const editingCompany = ref<{ id: number; name: string; email: string; phone: string } | null>(null)
const companyForm = reactive({ name: '', email: '', phone: '' })

function openAddCompany() {
  editingCompany.value = null
  companyForm.name = ''
  companyForm.email = ''
  companyForm.phone = ''
  showCompanyModal.value = true
}

function editCompany(company: { id: number; name: string; email: string; phone: string }) {
  editingCompany.value = company
  companyForm.name = company.name
  companyForm.email = company.email
  companyForm.phone = company.phone
  showCompanyModal.value = true
}

function saveCompany() {
  if (!companyForm.name) return
  if (editingCompany.value) {
    // Edit
    const idx = companies.value.findIndex((c) => c.id === editingCompany.value!.id)
    if (idx !== -1) {
      companies.value[idx] = { ...editingCompany.value, ...companyForm }
    }
  } else {
    // Add
    companies.value.push({ id: nextCompanyId++, ...companyForm })
  }
  closeCompanyModal()
}

function removeCompany(id: number) {
  companies.value = companies.value.filter((c) => c.id !== id)
}

function closeCompanyModal() {
  showCompanyModal.value = false
  editingCompany.value = null
  companyForm.name = ''
  companyForm.email = ''
  companyForm.phone = ''
}
</script>
