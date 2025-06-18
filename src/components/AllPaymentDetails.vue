<template>
  <transition name="bottom-sheet-invoice" appear>
    <div
      v-if="showAllPaymentsModal"
      class="absolute inset-0 z-60 flex items-end justify-center bg-black/60"
    >
      <div
        class="bg-[#18181b] rounded-2xl shadow-xl w-full p-6 flex flex-col gap-4 pb-20 max-h-[80vh] overflow-y-auto"
      >
        <div class="font-bold text-sm text-white mb-4">All Payment Details</div>
        <ul class="flex flex-col gap-4">
          <li v-for="payment in payments" :key="payment.id">
            <PaymentAccountItem
              :editPayment="editPayment"
              :removePayment="removePayment"
              :payment="payment"
            />
          </li>
        </ul>
        <button
          @click="showAllPaymentsModal = false"
          class="text-[10px] rounded-lg px-2.5 py-2 bg-white/20 text-white hover:bg-white/40 cursor-pointer mt-8"
        >
          Close
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import PaymentAccountItem from './PaymentAccountItem.vue'

defineProps<{
  payments: { id: number; bank: string; accountNumber: string; accountName: string }[]
  editPayment: (payment: {
    id: number
    bank: string
    accountNumber: string
    accountName: string
  }) => void
  removePayment: (id: number) => void
}>()
const showAllPaymentsModal = defineModel<boolean>('showAllPaymentsModal', { required: true })
</script>
