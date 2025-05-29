<script setup lang="ts">
import { ref } from 'vue'

import type { InvoiceItem } from '@/db'

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const props = defineProps<{ item: InvoiceItem; hovered?: boolean }>()
const emit = defineEmits<{ 'update:item': [item: InvoiceItem] }>()

import { watch } from 'vue'

const description = ref(props.item.description)
const quantity = ref(props.item.quantity)
const rate = ref(props.item.rate)

const textareaRef = ref<HTMLTextAreaElement | null>(null)

// Keep local state in sync if parent item changes
watch(
  () => props.item,
  (newItem) => {
    description.value = newItem.description
    quantity.value = newItem.quantity
    rate.value = newItem.rate
  },
)

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
</script>

<template>
  <div class="flex items-center flex-col md:flex-row">
    <textarea
      ref="textareaRef"
      class="text-xs text-white bg-transparent outline-none w-full flex resize-none p-2 sm:py-4 flex-1/2 pr-4 focus:bg-white/10 placeholder:text-white/15 sm:border-r border-white/10"
      rows="1"
      placeholder="Description"
      @blur="emitOnBlur"
      v-model="description"
    />

    <div class="text-xs w-full flex flex-1/2 border-white/5">
      <div class="flex gap-2 items-center flex-1 sm:border-r border-white/10">
        <input
          type="number"
          min="1"
          v-model.number="quantity"
          @input="debounceUpdateItem"
          class="text-xs bg-transparent border-none outline-none m-0 text-white focus:bg-white/10 p-2 sm:py-4 w-full placeholder:text-white/15"
          style="appearance: textfield"
        />
      </div>
      <label for="rate" class="flex items-center gap-1 flex-1 focus-within:bg-white/10">
        <span class="pl-2">₦</span>
        <input
          type="number"
          min="0"
          @input="debounceUpdateItem"
          v-model.number="rate"
          class="text-xs bg-transparent border-none outline-none m-0 text-white p-2 sm:py-4 w-full pl-0 placeholder:text-white/15"
          placeholder="0"
          id="rate"
        />
      </label>
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
