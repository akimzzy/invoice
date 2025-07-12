<script setup lang="ts">
import { RouterView } from 'vue-router'
import NotificationPopup from './components/NotificationPopup.vue'
import { useNotificationState } from './composables/useNotification'
import { computed } from 'vue'

const notificationState = useNotificationState()
const showNotification = computed(() => !!notificationState.value)
const notificationKey = computed(() => notificationState.value?.key)
const notificationType = computed(() => notificationState.value?.type || 'neutral')
const notificationMessage = computed(() => notificationState.value?.message || '')
const notificationDuration = computed(() => notificationState.value?.duration || 3500)
const notificationActionSlot = computed(() => notificationState.value?.actionSlot)
function dismissNotification() {
  notificationState.value = null
}
</script>

<template>
  <div
    class="relative min-h-screen bg-gradient-to-b from-black to-[#4b7378]/50 text-white px-2 sm:px-0"
  >
    <NotificationPopup
      v-if="showNotification"
      :key="notificationKey"
      v-model="showNotification"
      :type="notificationType"
      :duration="notificationDuration"
      @dismiss="dismissNotification"
    >
      {{ notificationMessage }}
      <template v-if="notificationActionSlot" #action>
        <component :is="notificationActionSlot" />
      </template>
    </NotificationPopup>
    <div class="z-20 absolute top-0 left-0 h-full w-full">
      <RouterView />
    </div>
  </div>
</template>
