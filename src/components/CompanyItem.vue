<template>
  <div
    class="flex justify-between items-center hover:bg-white/2 p-2 rounded-xl"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
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
          class="rounded-lg size-7 justify-center items-center bg-white/10 text-white hover:bg-white/40 cursor-pointer sm:flex hidden opacity-0 transition-opacity"
          :class="isHovered ? 'opacity-100' : ''"
        >
          <IconPen class="size-3" />
        </button>
        <button
          v-if="!selectMode"
          @click="emit('removeCompany')"
          class="rounded-lg size-7 justify-center items-center bg-white/10 text-white hover:bg-white/40 cursor-pointer sm:flex hidden opacity-0 transition-opacity"
          :class="isHovered ? 'opacity-100' : ''"
        >
          <IconTrash class="size-3" />
        </button>
        <IconDropdown
          v-if="!selectMode"
          class="sm:hidden"
          :options="[
            { label: 'Edit', value: 'edit', icon: IconPen },
            { label: 'Delete', value: 'edit', icon: IconTrash },
          ]"
          @select="handleComapnyItemDropdodwn"
        >
          <template #icon>
            <IconDots class="size-4 text-white" />
          </template>
        </IconDropdown>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { Company } from '@/db'
import IconPen from './icons/IconPen.vue'
import IconTrash from './icons/IconTrash.vue'
import IconDropdown from './IconDropdown.vue'
import IconDots from './icons/IconDots.vue'
import { ref } from 'vue'

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

const isHovered = ref(false)

function handleComapnyItemDropdodwn(value: string) {
  switch (value) {
    case 'edit':
      emit('editCompany')
      break
    case 'delete':
      emit('removeCompany')
      break
    default:
      break
  }
}
</script>
