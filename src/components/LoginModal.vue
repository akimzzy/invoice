<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <transition name="bottom-sheet-invoice" appear>
      <div class="w-full sm:w-2xl max-w-2xl" :class="{ 'pointer-events-none': isLoading }">
        <div v-if="!props.observer" class="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
        <div v-else-if="props.observer?.type === 'email'">
          <form
            @submit.prevent="submitEmail"
            class="bg-[#18181b] rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-white/10 text-xs"
          >
            <h2 class="text-lg font-semibold text-white mb-2">Login</h2>
            <input
              v-model="email"
              type="email"
              required
              class="w-full border border-white/30 bg-transparent rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              placeholder="Enter your email"
            />
            <div class="flex gap-2 justify-end" :class="{ 'opacity-25': isLoading }">
              <button
                type="button"
                class="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-xs cursor-pointer"
                @click="
                  () => {
                    observer?.onCancel()
                    $emit('close')
                  }
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 text-xs cursor-pointer"
              >
                {{ isLoading ? 'Loading...' : 'Continue' }}
              </button>
            </div>
          </form>
        </div>
        <div v-else-if="props.observer?.type === 'otp'">
          <form
            @submit.prevent="submitOtp"
            class="bg-[#18181b] rounded-3xl shadow-2xl p-8 flex flex-col gap-6 border border-white/10 text-xs"
          >
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-lg font-semibold text-white">Enter OTP</h2>
              <span></span>
            </div>
            <input
              v-model="otp"
              type="text"
              required
              class="w-full border border-white/30 bg-transparent rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 tracking-widest text-center"
              placeholder="Enter OTP"
            />
            <div class="flex gap-2 justify-end">
              <div class="flex gap-2">
                <button
                  type="button"
                  class="px-4 py-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 text-xs cursor-pointer"
                  @click="
                    () => {
                      observer?.onCancel()
                      $emit('close')
                    }
                  "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="px-4 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 text-xs cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </div>
            <div v-if="otpError" class="text-xs text-red-400 mt-2">{{ otpError }}</div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import type { DXCUserInteraction } from 'dexie-cloud-addon'

const props = defineProps<{
  observer: DXCUserInteraction | undefined
  isAuthenticated: boolean | '' | undefined
}>()
const emit = defineEmits(['close', 'success'])

const step = ref<'email' | 'otp'>('email')
const email = ref('')
const otp = ref('')
const otpError = ref('')

const isLoading = ref(false)

async function submitEmail() {
  if (props.observer) {
    try {
      props.observer.onSubmit({ email: email.value })
      otp.value = ''
      otpError.value = ''
    } catch (error) {
      console.log(error)
    }
  }
}

function submitOtp() {
  if (props.observer) {
    isLoading.value = true
    try {
      props.observer.onSubmit({ otp: otp.value })
      step.value = 'otp'
      otp.value = ''
      otpError.value = ''
    } catch (error) {
      console.log(error)
    } finally {
      isLoading.value = false
    }
  }
  // Simulate OTP check (replace with real logic)
  if (otp.value === '123456') {
    emit('success')
    emit('close')
  } else {
    otpError.value = 'Invalid OTP. Please try again.'
  }
}

watch(
  () => props.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      emit('close')
    }
  },
)
</script>

<style>
.bottom-sheet-invoice-enter-active,
.bottom-sheet-invoice-leave-active {
  transition:
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.bottom-sheet-invoice-enter-from,
.bottom-sheet-invoice-leave-to {
  opacity: 0;
  transform: translateY(5%);
}
.bottom-sheet-invoice-enter-to,
.bottom-sheet-invoice-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.material-icons {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: normal;
  font-size: 20px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>
