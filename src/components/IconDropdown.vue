<template>
  <div class="relative inline-block" ref="dropdownRef">
    <button
      class="flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 p-2 focus:outline-none cursor-pointer"
      @click="toggleDropdown"
      :aria-expanded="isOpen"
      tabindex="0"
      @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown"
    >
      <slot name="icon">
        <IconGear class="size-4 text-white" />
      </slot>
    </button>
    <transition name="dropdown-fade">
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 bg-[#23232b] rounded-lg shadow-lg z-20 border border-white/10 overflow-hidden animate-dropdown"
        :style="
          dropdownPosition === 'top'
            ? { bottom: '100%', top: 'auto', marginBottom: '8px' }
            : { top: '100%' }
        "
      >
        <slot name="top" />

        <ul class="divide-y divide-white/20">
          <li
            v-for="option in options"
            :key="option.value"
            @click="option.disabled ? undefined : selectOption(option.value)"
            class="p-3 cursor-pointer hover:bg-white/10 text-white flex items-center gap-2 transition-colors duration-150"
            :class="{ 'opacity-50 pointer-events-none': option.disabled }"
          >
            <component v-if="option.icon" :is="option.icon" class="size-4 mr-2" />
            <div>
              <span>{{ option.label }}</span>
              <p v-if="option.subText" class="text-[10px] mt-0.5 text-white/50">
                {{ option.subText }}
              </p>
            </div>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef, nextTick, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import IconGear from './icons/IconGear.vue'

const props = defineProps({
  options: {
    type: Array as () => Array<{
      label: string
      value: string
      icon?: any
      subText?: string
      disabled?: boolean
    }>,
    required: true,
  },
})

const emit = defineEmits<{
  select: [val: string]
}>()

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
function selectOption(val: string) {
  emit('select', val)
  isOpen.value = false
}

function updateDropdownPosition() {
  const dropdown = dropdownRef.value
  if (!dropdown) return
  const rect = dropdown.getBoundingClientRect()
  const dropdownHeight = 40 + props.options.length * 36
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
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
