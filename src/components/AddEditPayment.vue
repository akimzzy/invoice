<template>
  <transition name="bottom-sheet-invoice" appear>
    <div
      v-if="showPaymentModal"
      class="absolute inset-0 z-70 flex items-end justify-center bg-black/60"
    >
      <div class="bg-[#18181b] rounded-2xl shadow-xl w-full p-6 flex flex-col gap-2 pb-20">
        <div class="font-bold text-xs text-white mb-4">
          {{ editingPayment ? 'Edit Payment' : 'Add Payment' }}
        </div>
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Bank Name"
          v-model="paymentForm.bank"
        />
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Account Number"
          v-model="paymentForm.accountNumber"
        />
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Account Name"
          v-model="paymentForm.accountName"
        />
        <div class="flex gap-2 justify-end mt-4">
          <button
            @click="closePaymentModal"
            class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="savePayment"
            class="text-[10px] rounded-lg px-2.5 py-1 bg-white/40 text-white hover:bg-white/60 cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  showPaymentModal: boolean
  editingPayment: { id: number; bank: string; accountNumber: string; accountName: string } | null
  paymentForm: { bank: string; accountNumber: string; accountName: string }
  closePaymentModal: () => void
  savePayment: () => void
}>()
</script>
