<script setup lang="ts">
import { ref, onMounted } from 'vue'

import type { InvoiceItem } from '@/db'

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const props = defineProps<{ item: InvoiceItem; hovered?: boolean }>()
const emit = defineEmits<{ 'update:item': [item: InvoiceItem] }>()

const description = ref(props.item.description)
const quantity = ref(props.item.quantity)
const rate = ref(props.item.rate)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

function updateItem() {
  emit('update:item', {
    description: description.value,
    quantity: quantity.value,
    rate: rate.value,
  })
}

function debounceUpdateItem() {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    updateItem()
  }, 500)
}

function emitOnBlur() {
  updateItem()
}

onMounted(() => {
  description.value = props.item.description
  quantity.value = props.item.quantity
  rate.value = props.item.rate
  textareaRef.value?.focus()
})
</script>

<template>
  <div class="flex flex-col md:flex-row h-full items-center text-[10px]">
    <textarea
      ref="textareaRef"
      class="text-white bg-transparent outline-none w-full flex resize-none p-2 sm:py-3.5 flex-1/2 pr-4 focus:bg-white/10 placeholder:text-white/15 border-white/10 h-full"
      rows="1"
      placeholder="Description"
      @blur="emitOnBlur"
      v-model="description"
    />

    <div class="w-full flex-1/2 relative flex">
      <div class="w-18 overflow-hidden">
        <input
          type="number"
          min="1"
          v-model.number="quantity"
          @input="debounceUpdateItem"
          class="outline-none m-0 text-white focus:bg-white/10 p-2 sm:py-3.5 w-full placeholder:text-white/15 border border-b-0 border-white/10 border-t-0"
          style="appearance: textfield"
        />
      </div>

      <label
        for="rate"
        class="flex items-center gap-1 flex-1 focus-within:bg-white/10 border-t-0 border-l-0 border border-b-0 border-white/10"
      >
        <span class="pl-2">₦</span>
        <input
          type="number"
          min="0"
          @input="debounceUpdateItem"
          v-model.number="rate"
          class="bg-transparent border-none outline-none m-0 text-white p-2 sm:py-2.5 w-full pl-0 placeholder:text-white/15"
          placeholder="0"
          id="rate"
        />
      </label>

      <span
        class="pl-2 p-1.5 text-[10px] text-white/30 flex-wrap text-center rounded-lg ml-1 w-30 flex items-center justify-end"
        >₦{{ quantity && rate ? (quantity * rate).toLocaleString() : '0' }}</span
      >
    </div>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
