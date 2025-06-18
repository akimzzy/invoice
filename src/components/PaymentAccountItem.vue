<template>
  <div class="flex justify-between items-center">
    <div>
      <div class="text-xs mb-1 text-white">{{ payment.bank }}</div>
      <div class="flex gap-2 items-center text-white/60 text-[10px]">
        <span>{{ payment.accountNumber }}</span>
        <span
          v-if="payment.accountNumber && payment.accountName"
          class="size-1 bg-white/30 rounded-full inline-block"
        ></span>
        <span>{{ payment.accountName }}</span>
      </div>
    </div>
    <div class="flex gap-2 text-[10px]">
      <button
        @click="editPayment(payment)"
        class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
      >
        Edit
      </button>
      <button
        @click="removePayment(payment.id)"
        class="text-[10px] rounded-lg px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 cursor-pointer"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Payment {
  id: number
  bank: string
  accountNumber: string
  accountName: string
}
defineProps<{
  payment: Payment
  editPayment: (payment: Payment) => void
  removePayment: (id: number) => void
}>()
</script>
