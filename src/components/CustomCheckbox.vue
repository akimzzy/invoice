<template>
  <label class="inline-flex items-center cursor-pointer select-none">
    <input
      type="checkbox"
      class="sr-only"
      :checked="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      :disabled="disabled"
    />
    <span
      :class="[
        'w-5 h-5 flex items-center justify-center rounded-lg transition-all',
        modelValue ? 'bg-neutral-50' : 'bg-transparent',
        disabled ? 'opacity-40 cursor-not-allowed' : 'border border-neutral-700',
        !modelValue && !disabled ? 'border-2 border-neutral-700' : '',
      ]"
    >
      <svg
        v-if="modelValue"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="none"
        viewBox="0 0 20 20"
      >
        <path
          d="M5.5 10.5l3 3 6-6"
          stroke="#18181b"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </label>
</template>

<script setup lang="ts">
defineProps({
  modelValue: Boolean,
  disabled: Boolean,
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
span {
  box-sizing: border-box;
}
</style>
