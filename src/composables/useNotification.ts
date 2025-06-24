import { shallowRef } from 'vue'

export type NotificationType = 'success' | 'error' | 'neutral'

interface NotificationOptions {
  message: string
  type?: NotificationType
  duration?: number
  actionSlot?: any
}

const notificationState = shallowRef<null | {
  message: string
  type: NotificationType
  duration: number
  actionSlot?: any
  key: number
}>(null)

let keyCounter = 0

export function useNotification() {
  function notify({ message, type = 'neutral', duration = 3500, actionSlot }: NotificationOptions) {
    notificationState.value = {
      message,
      type,
      duration,
      actionSlot,
      key: ++keyCounter,
    }
  }
  function clear() {
    notificationState.value = null
  }
  return { notify, clear, notificationState }
}

export function useNotificationState() {
  return notificationState
}
