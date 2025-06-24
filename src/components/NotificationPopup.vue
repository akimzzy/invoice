<template>
  <transition name="notification-slide" appear>
    <div
      v-if="visible"
      :class="[
        'fixed top-6 left-1/2 -translate-x-1/2 min-w-[280px] max-w-[90vw] z-[9999] rounded-2xl flex items-center px-4 py-2 gap-4 text-[10px] font-medium transition-all duration-350',
        typeClass,
      ]"
    >
      <div class="flex-1 flex items-center gap-2">
        <slot> </slot>
        <div v-if="$slots.action" class="ml-4">
          <slot name="action" />
        </div>
      </div>
      <button
        class="ml-2 bg-transparent border-none text-gray-400 text-xl cursor-pointer"
        @click="dismiss"
      >
        &times;
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
const props = defineProps({
  type: { type: String, default: 'neutral' }, // 'success', 'error', 'neutral'
  duration: { type: Number, default: 3600 },
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'dismiss'])
const visible = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val && props.duration > 0) {
      clearTimeout(timer)
      timer = setTimeout(() => dismiss(), props.duration)
    }
  },
)

function dismiss() {
  visible.value = false
  emit('update:modelValue', false)
  emit('dismiss')
}

onMounted(() => {
  if (props.modelValue && props.duration > 0) {
    timer = setTimeout(() => dismiss(), props.duration)
  }
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})

const typeClass = computed(() => {
  if (props.type === 'success') return 'bg-gray-900 text-white'
  if (props.type === 'error') return 'bg-red-500 text-white'
  return 'bg-gray-900 text-white'
})
</script>

<style scoped>
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.notification-slide-enter-from {
  opacity: 0;
  transform: translateY(-40px) scale(0.98);
}
.notification-slide-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.notification-slide-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.notification-slide-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(0.98);
}
</style>
