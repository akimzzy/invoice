<script setup lang="ts">
import { ref } from 'vue'
import IconMinus from './icons/IconMinus.vue'
import IconPlus from './icons/IconPlus.vue'
import type { InvoiceItem } from '@/db'

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

const props = defineProps<{ item: InvoiceItem; hovered?: boolean }>()
const emit = defineEmits<{ 'update:item': [item: InvoiceItem] }>()

import { watch } from 'vue'

const description = ref(props.item.description)
const quantity = ref(props.item.quantity)
const rate = ref(props.item.rate)

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

function increment() {
  quantity.value++
  updateItem()
}

function decrement() {
  if (quantity.value > 1) {
    quantity.value--
    updateItem()
  }
}
</script>

<template>
  <div class="flex items-center">
    <textarea
      class="text-xs text-white bg-transparent border-none outline-none w-full flex resize-none p-2 py-4 rounded-lg flex-1 pr-4"
      rows="1"
      placeholder="Description"
      @blur="emitOnBlur"
      v-model="description"
    />
    <div class="flex gap-2 items-center">
      <button
        :style="{
          opacity: props.hovered ? 1 : 0,
          pointerEvents: props.hovered ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }"
        class="size-7 bg-white/5 rounded-full flex justify-center items-center cursor-pointer hover:bg-white/20"
        type="button"
        @click="decrement"
      >
        <IconMinus class="text-white/50 size-2.5" />
      </button>
      <span class="text-xs min-w-4 text-center">{{ quantity }}</span>
      <button
        :style="{
          opacity: props.hovered ? 1 : 0,
          pointerEvents: props.hovered ? 'auto' : 'none',
          transition: 'opacity 0.2s',
        }"
        class="size-7 bg-white/5 hover:bg-white/20 rounded-full flex justify-center items-center cursor-pointer"
        type="button"
        @click="increment"
      >
        <IconPlus class="text-white/50 size-2.5" />
      </button>
    </div>
    <label for="rate" class="flex items-center gap-1 pl-4">
      <span>₦</span>
      <input
        type="number"
        min="0"
        @input="debounceUpdateItem"
        v-model.number="rate"
        class="text-xs text-white bg-transparent border-none outline-none flex p-0 m-0 w-22"
        placeholder="0"
        id="rate"
      />
    </label>
  </div>
</template>
