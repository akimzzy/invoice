<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <ClientFormInner :client="client" @close="$emit('close')"/>
  </div>
</template>

<script setup lang="ts">
import ClientFormInner from './ClientFormInner.vue'
import type { Client } from '@/db'

 defineProps<{
  client?: Client | null
}>()
 defineEmits(['close', 'saved'])
</script>
