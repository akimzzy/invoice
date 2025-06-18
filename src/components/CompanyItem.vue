<template>
  <div class="flex justify-between items-center hover:bg-white/5 p-2 rounded-xl">
    <div class="flex gap-2 items-center">
      <div
        class="flex flex-col items-center justify-center w-10 h-10 border border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 text-white/60 text-[10px]"
      >
        <span v-if="company.logoUrl"
          ><img :src="company.logoUrl" alt="Logo" class="w-8 h-8 object-cover rounded-full"
        /></span>
        <span v-else> Logo </span>
      </div>
      <div class="flex flex-col gap-1">
        <h3 class="text-xs">{{ company.name }}</h3>
        <div v-if="company.phone || company.email" class="flex gap-2 items-center">
          <span class="text-white/50">{{ company.phone || company.email }}</span>
          <span
            v-if="company.phone && company.email"
            class="size-1 bg-white/30 rounded-full inline-block"
          ></span>
          <span class="text-white/50" v-if="company.phone && company.email">{{
            company.email
          }}</span>
        </div>
      </div>
    </div>
    <slot>
      <div class="flex gap-2">
        <button
          v-if="selectMode && !selected"
          @click="emit('selectCompany')"
          class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
        >
          select
        </button>
        <button
          v-if="selectMode && selected"
          class="text-[10px] rounded-lg px-2.5 py-1 bg-white/5 text-white/50 cursor-not-allowed"
        >
          selected
        </button>
        <button
          v-if="!selectMode"
          @click="emit('editCompany')"
          class="text-[10px] rounded-lg size-7 flex justify-center items-center bg-white/20 text-white hover:bg-white/40 cursor-pointer"
        >
          <IconPen class="size-3" />
        </button>
        <button
          v-if="!selectMode"
          @click="emit('removeCompany')"
          class="text-[10px] rounded-lg size-7 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 cursor-pointer"
        >
          <IconTrash class="size-3" />
        </button>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { Company } from '@/db'
import IconPen from './icons/IconPen.vue'
import IconTrash from './icons/IconTrash.vue'

defineProps<{
  company: Company
  selectMode?: boolean
  selected?: boolean
}>()
const emit = defineEmits<{
  editCompany: []
  removeCompany: []
  selectCompany: []
}>()
</script>
