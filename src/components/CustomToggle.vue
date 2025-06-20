<template>
  <button
    :class="[
      'inline-flex items-center bg-none border-none outline-none p-0 transition-opacity',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ]"
    :disabled="disabled"
    @click="toggle"
    type="button"
    :aria-pressed="modelValue"
  >
    <span v-if="label" class="mr-2 text-[10px] text-white/70">{{ label }}</span>
    <span
      :class="[
        'relative inline-block align-middle transition-colors',
        modelValue ? 'bg-green-500' : 'bg-gray-300',
        'rounded-full',
      ]"
      :style="trackStyle"
    >
      <span
        :class="['absolute top-0.5 bg-white shadow', 'transition-all duration-200 rounded-full']"
        :style="thumbStyle"
      />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  disabled: { type: Boolean, default: false },
  label: { type: String, default: '' },
  colorOn: { type: String, default: '#22c55e' }, // green-500
  colorOff: { type: String, default: '#d1d5db' }, // gray-300
  size: { type: String, default: '22px' },
})
const emit = defineEmits(['update:modelValue'])
const toggle = () => {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}
const trackStyle = computed(() => ({
  backgroundColor: props.modelValue ? props.colorOn : props.colorOff,
  width: `calc(${props.size} * 2)`,
  height: props.size,
}))
const thumbStyle = computed(() => ({
  left: props.modelValue ? `calc(${props.size} + ${'2px'})` : '2px',
  width: `calc(${props.size} - 4px)`,
  height: `calc(${props.size} - 4px)`,
}))
</script>
