<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <transition name="bottom-sheet-invoice" appear>
      <div
        class="sm:rounded-3xl bg-[#18181b] w-full h-full max-h-full flex flex-col justify-between py-10 relative border border-white/10 sm:w-2xl max-w-2xl sm:h-[50rem] sm:max-h-[90vh] overflow-hidden"
        :class="{ 'pointer-events-none': isLoading }"
      >
        <div class="p-8">
          <h1 class="font-semibold text-xl">Log in for cloud features</h1>
          <p class="text-xs text-white/50 mt-2">
            Sync invoices, manage companies, accept payments, and share links — all in one place.
          </p>
        </div>
        <div v-if="!props.observer" class="flex justify-center items-center h-full">
          <LoadingSpinner />
        </div>
        <div v-else-if="props.observer?.type === 'email'">
          <form @submit.prevent="submitEmail" class="p-8 flex flex-col text-xs">
            <h2 class="text-sm font-semibold text-white mb-2">Email</h2>
            <input
              v-model="email"
              type="email"
              required
              class="w-full border border-white/30 bg-transparent rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              placeholder="Enter your email"
            />
            <div class="flex gap-2 mt-6 justify-end" :class="{ 'opacity-25': isLoading }">
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
          <form @submit.prevent="submitOtp" class="p-8 flex flex-col text-xs">
            <h2 class="text-sm font-semibold text-white mb-2">Enter OTP</h2>

            <input
              v-model="otp"
              type="text"
              required
              class="w-full border border-white/30 bg-transparent rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-white/30 tracking-widest text-center"
              placeholder="Enter OTP"
            />

            <div class="flex gap-2 mt-6 justify-end">
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
