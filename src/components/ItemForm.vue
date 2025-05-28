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
  <div class="flex items-center flex-col md:flex-row">
    <textarea
      class="text-xs text-white bg-transparent border-none outline-none w-full flex resize-none p-2 py-4 flex-1/2 pr-4 focus:bg-white/10 rounded-lg"
      rows="1"
      placeholder="Description"
      @blur="emitOnBlur"
      v-model="description"
      autofocus
    />

    <div class="text-xs w-full flex flex-1/2">
      <div class="flex gap-2 items-center flex-1">
        <!-- <button
          :style="{
            opacity: props.hovered ? 1 : 0,
            pointerEvents: props.hovered ? 'auto' : 'none',
            transition: 'opacity 0.2s',
          }"
          class="size-7 bg-white/5 rounded-full flex justify-center items-center cursor-pointer hover:bg-white/20 focus:bg-white/10"
          type="button"
          @click="decrement"
        >
          <IconMinus class="text-white/50 size-2.5" />
        </button> -->
        <input
          type="number"
          min="1"
          v-model.number="quantity"
          @input="debounceUpdateItem"
          class="text-xs bg-transparent border-none outline-none m-0 text-white focus:bg-white/10 p-2 py-4 w-full rounded-lg"
          style="appearance: textfield"
        />
        <!-- <button
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
        </button> -->
      </div>
      <label for="rate" class="flex items-center gap-1 flex-1">
        <!-- <span>₦</span> -->
        <input
          type="number"
          min="0"
          @input="debounceUpdateItem"
          v-model.number="rate"
          class="text-xs bg-transparent border-none outline-none m-0 text-white focus:bg-white/10 p-2 py-4 w-full rounded-lg"
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
