<template>
  <div class="relative inline-block w-full" ref="dropdownRef">
    <div
      class="bg-white/5 text-white text-xs rounded-lg gap-3 min-w-52 px-4 py-2 cursor-pointer flex justify-between items-center select-none border border-white/20 hover:bg-white/20 transition-colors duration-200"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      tabindex="0"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
    >
      <span>{{ selectedLabel }}</span>
      <svg
        :class="['transition-transform', isOpen ? 'rotate-180' : '']"
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="#fff"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
    <transition name="dropdown-fade">
      <ul
        v-if="isOpen"
        :class="[
          'absolute left-0 w-full bg-[#23232b] rounded-lg shadow-lg z-10 border border-white/10 overflow-hidden animate-dropdown',
          dropdownPosition === 'top' ? 'mb-2 mt-0 bottom-full' : 'mt-2',
        ]"
        :style="dropdownPosition === 'top' ? { bottom: '100%' } : { top: '100%' }"
      >
        <li
          v-for="option in options"
          :key="option.value"
          @click="selectOption(option.value)"
          class="px-4 py-2 cursor-pointer hover:bg-white/10 text-white text-xs transition-colors duration-150"
          :class="{ 'bg-white/10': option.value === modelValue }"
        >
          {{ option.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, computed, defineProps, defineEmits, nextTick, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
  options: {
    type: Array as () => Array<{ label: string; value: string | number | undefined }>,
    required: true,
  },
  modelValue: {
    type: null,
    required: false,
    default: null,
  },
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const dropdownRef = useTemplateRef<HTMLElement>('dropdownRef')
const dropdownPosition = ref<'bottom' | 'top'>('bottom')

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(() => {
      updateDropdownPosition()
    })
  }
}
function selectOption(val: string | number | undefined) {
  emit('update:modelValue', val)
  isOpen.value = false
}
const selectedLabel = computed(() => {
  const found = props.options.find((opt) => opt.value === props.modelValue)
  return found ? found.label : 'Select...'
})

function updateDropdownPosition() {
  const dropdown = dropdownRef.value
  if (!dropdown) return
  const rect = dropdown.getBoundingClientRect()
  // Estimate dropdown height: 40px base + 36px per option
  const dropdownHeight = 40 + props.options.length * 36
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  // If not enough space below but enough above, show above
  if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
    dropdownPosition.value = 'top'
  } else if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
    dropdownPosition.value = 'top'
  } else {
    dropdownPosition.value = 'bottom'
  }
}

onClickOutside(dropdownRef, () => {
  isOpen.value = false
})

// Recalculate position if options change or window resizes
watch(
  () => props.options,
  () => {
    if (isOpen.value) nextTick(updateDropdownPosition)
  },
)
window.addEventListener('resize', () => {
  if (isOpen.value) updateDropdownPosition()
})
</script>

<style scoped>
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
