<template>
  <transition name="bottom-sheet-invoice" appear>
    <div
      v-if="showAllCompaniesModal"
      class="absolute inset-0 z-60 flex items-end justify-center bg-black/60 text-[10px]"
    >
      <div
        class="bg-[#18181b] rounded-2xl shadow-xl w-full p-6 flex flex-col gap-2 pb-20 max-h-[80vh] overflow-y-auto"
      >
        <div class="font-bold text-xs text-white mb-4 flex justify-between">
          {{ selectMode ? 'Select Company' : 'All Companies' }}
          <button
            v-if="!selectMode"
            class="text-[10px] rounded-lg px-2.5 py-1 bg-white/20 text-white hover:bg-white/40 cursor-pointer"
            @click="emit('openEditCompanyModal', undefined)"
          >
            Add Company
          </button>
        </div>
        <ul class="flex flex-col gap-1">
          <li v-for="company in companies" :key="company.id">
            <CompanyItem
              @removeCompany="deleteCompany(company.id)"
              @editCompany="emit('openEditCompanyModal', company)"
              @selectCompany="emit('selectCompany', company.id)"
              :company="company"
              :select-mode="selectMode"
              :selected="selectedCompanyId === company.id"
            />
          </li>
        </ul>
        <button
          @click="showAllCompaniesModal = false"
          class="text-[10px] rounded-lg px-2.5 py-2 bg-white/20 text-white hover:bg-white/40 cursor-pointer mt-8"
        >
          Close
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Company } from '@/db'
import CompanyItem from './CompanyItem.vue'
import { useObservable, from } from '@vueuse/rxjs'
import { liveQuery } from 'dexie'
import { fetchAllCompanies, deleteCompany } from '@/db/companyActions'

withDefaults(defineProps<{ selectMode?: boolean; selectedCompanyId?: string }>(), {
  selectMode: false,
})

const emit = defineEmits<{
  openEditCompanyModal: [company: Company | undefined]
  selectCompany: [id: string]
}>()

const showAllCompaniesModal = defineModel<boolean>('showAllCompaniesModal', { required: true })

const companies = useObservable<Company[]>(from(liveQuery(() => fetchAllCompanies())))
</script>
