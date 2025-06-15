<template>
  <div class="flex flex-col divide-y divide-white/10">
    <!-- Company Details Section -->
    <section class="pb-10 pt-4">
      <div class="flex items-center justify-between mb-1">
        <span class="font-semibold text-sm">Company Details</span>
      </div>
      <div class="text-white/60 text-[10px]">
        Your company details shown on shared or downloaded invoices.
      </div>
      <div class="text-[10px]">
        <div class="flex justify-between items-center mt-6">
          <div class="flex gap-2 items-center">
            <div
              class="flex flex-col items-center justify-center w-10 h-10 border border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 font-bold text-white/60 text-xl"
            >
              <span>C</span>
            </div>
            <div>
              <h3 class="text-xs mb-1">Coolzey Kreative Hub</h3>
              <div class="flex gap-2 items-center">
                <span class="text-white/50">+234 987654321</span>
                <span class="size-1 bg-white/30 rounded-full inline-block"></span>
                <span class="text-white/50">coolzeykreativehub@email.com</span>
              </div>
            </div>
          </div>
          <button class="p-1 bg-red-600 rounded-lg px-2 cursor-pointer hover:bg-red-700">
            Remove
          </button>
        </div>
        <div class="flex mt-4">
          <button class="p-1 bg-white text-black rounded-lg px-2 cursor-pointer hover:bg-white/35">
            Change company
          </button>
        </div>
      </div>
      <!-- <div v-if="invoice.companyInfo" class="flex flex-col gap-2">
        <div class="flex items-center gap-4 mb-2">
          <div v-if="invoice.companyInfo.logo" class="relative group">
            <img
              :src="invoice.companyInfo.logo"
              alt="Logo"
              class="w-12 h-12 object-contain rounded border border-white/20 bg-white/10"
            />
            <button
              class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-[10px] hover:bg-red-700"
              @click="removeLogo"
              title="Remove Logo"
              type="button"
            >
              ×
            </button>
          </div>
          <label
            v-else
            class="flex flex-col items-center justify-center w-12 h-12 border border-dashed border-white/20 rounded cursor-pointer bg-white/5 hover:bg-white/10 text-white/60 text-[10px]"
          >
            <span>Logo</span>
            <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
          </label>
        </div>
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Company Name"
          v-model="invoice.companyInfo.name"
          @change="updateInvoice(invoice.id, { companyInfo: { ...invoice.companyInfo } })"
        />
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Email"
          v-model="invoice.companyInfo.email"
          @change="updateInvoice(invoice.id, { companyInfo: { ...invoice.companyInfo } })"
        />
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Phone"
          v-model="invoice.companyInfo.phone"
          @change="updateInvoice(invoice.id, { companyInfo: { ...invoice.companyInfo } })"
        />
      </div> -->
    </section>
    <!-- Shareable Link Section -->
    <section class="py-10">
      <div class="flex items-center justify-between mb-1">
        <span class="font-semibold text-sm">Shareable Link</span>

        <label class="flex items-center gap-2 cursor-pointer">
          <CustomToggle
            :model-value="enableLiveUpdate"
            size="18px"
            @update:model-value="updateEnableLiveUpdate"
            :label="enableLiveUpdate ? 'Disable Live Update' : 'Enable Live Update'"
          />
        </label>
      </div>
      <div class="text-white/60 text-[10px] mb-2">
        Readonly link to share with clients. Enable live update for real-time changes.
      </div>
      <div class="flex items-center gap-4 mt-6">
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white flex-1"
          :value="`/invoice/${invoice.id}`"
          readonly
        />
        <button class="text-[10px] px-2 py-1 rounded bg-white/20 text-white hover:bg-white/40">
          <IconClipboard class="size-4" />
        </button>
      </div>
    </section>
    <!-- Payment Section -->
    <section class="pt-10">
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center justify-between mb-1">
            <span class="font-semibold text-sm">Payment</span>
          </div>
          <div class="text-white/60 text-[10px] mb-2">
            Provide your payment details here to receive payments from your client.
          </div>
        </div>

        <CustomToggle
          :model-value="enablePayment"
          size="18px"
          @update:model-value="updateEnablePayment"
          :label="enablePayment ? 'Disable Payment' : 'Enable Payment'"
        />
      </div>
      <div class="flex flex-col gap-2 mt-6">
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Bank Name"
          v-model="invoice.paymentBank"
          @change="updateInvoice(invoice.id, { paymentBank: invoice.paymentBank })"
        />
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Account Number"
          v-model="invoice.paymentAccount"
          @change="updateInvoice(invoice.id, { paymentAccount: invoice.paymentAccount })"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IconClipboard from './icons/IconClipboard.vue' // Adjust if you have a dedicated clipboard icon
import CustomToggle from './CustomToggle.vue' // Adjust if you have a dedicated clipboard icon

const props = defineProps({
  invoice: { type: Object, required: true },
  updateInvoice: { type: Function, required: true },
})
const { invoice, updateInvoice } = props

const enableLiveUpdate = ref<boolean>(invoice.realtimeShare || false)
function updateEnableLiveUpdate(value: boolean) {
  enableLiveUpdate.value = value
  // updateInvoice(invoice.id, { realtimeShare: enableLiveUpdate.value })
}

const enablePayment = ref<boolean>(invoice.realtimeShare || false)
function updateEnablePayment(value: boolean) {
  enablePayment.value = value
  // updateInvoice(invoice.id, { realtimeShare: enableLiveUpdate.value })
}

function handleLogoUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files || !input.files[0]) return
  const file = input.files[0]
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.')
    return
  }
  if (file.size > 1024 * 1024) {
    alert('Logo image must be less than 1MB.')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => {
    const logo = e.target?.result as string
    updateInvoice(invoice.id, { companyInfo: { ...invoice.companyInfo, logo } })
  }
  reader.readAsDataURL(file)
}

function removeLogo() {
  updateInvoice(invoice.id, { companyInfo: { ...invoice.companyInfo, logo: undefined } })
}
</script>
