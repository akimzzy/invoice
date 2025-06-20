<template>
  <div class="flex flex-col divide-y divide-white/10">
    <!-- Company Details Section -->
    <section class="pb-8 pt-4">
      <div class="flex items-center justify-between mb-1">
        <span class="font-semibold text-sm">Company Details</span>
      </div>
      <div class="text-white/60 text-[10px]">
        Your company details shown on shared or downloaded invoices.
      </div>
      <div class="text-[10px]">
        <CompanyItem class="mt-4" v-if="company" :company="company">
          <button
            @click="updateInvoiceCompany(undefined)"
            class="p-1 border-gray-500/30 text-white hover:bg-white/10 border rounded-lg px-2 cursor-pointer"
          >
            Remove
          </button>
        </CompanyItem>
        <div class="flex mt-4">
          <button
            class="bg-white/10 text-white rounded-lg px-2 py-1 cursor-pointer hover:bg-white/35"
            @click="showSelectCompanyModal = true"
          >
            {{ company ? 'Change' : 'Choose' }} company
          </button>
        </div>
      </div>
    </section>
    <!-- Shareable Link Section -->
    <section class="py-8">
      <div class="flex items-center justify-between mb-1">
        <span class="font-semibold text-sm">Shareable Link</span>
      </div>
      <div class="text-white/60 text-[10px]">Readonly link to share with clients.</div>
      <div class="flex items-center gap-1 mt-4">
        <div
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white flex-1"
        >
          {{ `/invoice/${invoice.id}` }}
        </div>

        <button
          class="rounded-lg cursor-pointer hover:bg-white/10 px-2 py-2 text-[10px] text-white flex gap-1 items-center"
        >
          Copy <IconClipboard class="size-3" />
        </button>
      </div>
      <div class="flex items-center justify-between mt-6">
        <div class="flex flex-col">
          <span class="text-[10px] mb-1">Enable live update for real-time changes.</span>
          <span class="text-[10px] text-white/60">{{
            enableLiveUpdate ? 'Toggle to turn off' : 'Toggle to turn on'
          }}</span>
        </div>

        <CustomToggle
          :model-value="enableLiveUpdate"
          @update:model-value="updateEnableLiveUpdate"
        />
      </div>
    </section>
    <!-- Payment Section -->
    <!-- <section class="pt-8">
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-sm">Payment</span>
          </div>
          <div class="text-white/60 text-[10px]">
            Provide your payment details here to receive payments from your client.
          </div>
        </div>

        <CustomToggle
          :model-value="enablePayment"
          size="22px"
          @update:model-value="updateEnablePayment"
          :label="enablePayment ? 'Disable Payment' : 'Enable Payment'"
        />
      </div>
    </section> -->

    <AllCompanies
      v-model:show-all-companies-modal="showSelectCompanyModal"
      :select-mode="true"
      @select-company="updateInvoiceCompany"
      :selected-company-id="invoice.companyId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconClipboard from './icons/IconClipboard.vue'
import CustomToggle from './CustomToggle.vue'
import { fetchCompany } from '@/db/companyActions'
import { asyncComputed } from '@vueuse/core'
import type { Invoice } from '@/db'
import AllCompanies from './AllCompanies.vue'
import CompanyItem from './CompanyItem.vue'
import { updateInvoice } from '@/db/invoiceActions'

const props = defineProps<{
  invoice: Invoice
}>()
const emit = defineEmits<(e: 'updateInvoice', id: string, updates: Partial<Invoice>) => void>()

function updateInvoiceCompany(id?: string) {
  emit('updateInvoice', props.invoice.id, { companyId: id })
}

const showSelectCompanyModal = ref(false)

const enableLiveUpdate = ref<boolean>(props.invoice.enableLiveUpdate || false)
function updateEnableLiveUpdate(value: boolean) {
  enableLiveUpdate.value = value
  updateInvoice(props.invoice.id, { enableLiveUpdate: value })
}

const company = asyncComputed(async () => {
  if (props.invoice.companyId) {
    return fetchCompany(props.invoice.companyId)
  }
}, undefined)

// const enablePayment = ref<boolean>(props.invoice.realtimeShare || false)
// function updateEnablePayment(value: boolean) {
//   enablePayment.value = value
//   // updateInvoice(invoice.id, { realtimeShare: enableLiveUpdate.value })
// }

// function handleLogoUpload(event: Event) {
//   const input = event.target as HTMLInputElement
//   if (!input.files || !input.files[0]) return
//   const file = input.files[0]
//   if (!file.type.startsWith('image/')) {
//     alert('Please select a valid image file.')
//     return
//   }
//   if (file.size > 1024 * 1024) {
//     alert('Logo image must be less than 1MB.')
//     return
//   }
//   const reader = new FileReader()
//   reader.onload = (e) => {
//     const logo = e.target?.result as string
//     console.log(logo)
//     // emit('updateInvoice', invoice.id, { companyId: '' })
//   }
//   reader.readAsDataURL(file)
// }
</script>
