<template>
  <transition name="bottom-sheet-invoice" appear>
    <div
      v-if="showCompanyModal"
      class="absolute inset-0 z-70 flex items-end justify-center bg-black/60"
    >
      <div class="bg-[#18181b] rounded-2xl shadow-xl w-full p-6 flex flex-col gap-2 pb-20">
        <div class="font-bold text-xs text-white mb-4">
          {{ editingCompany ? 'Edit Company' : 'Add Company' }}
        </div>
        <div class="flex items-center gap-4">
          <div v-if="companyForm.logoUrl" class="relative group">
            <img
              :src="companyForm.logoUrl"
              alt="Logo"
              class="w-16 h-16 object-contain rounded-lg border border-white/20 bg-white/10"
            />
            <button
              class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 size-5 cursor-pointer flex items-center justify-center"
              title="Remove Logo"
              type="button"
            >
              ×
            </button>
          </div>
          <label
            v-else
            class="flex flex-col items-center justify-center w-16 h-16 border border-dashed border-white/20 rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 text-white/60 text-[10px]"
          >
            <span>Logo</span>
            <input type="file" accept="image/*" class="hidden" @change="onCompanyLogoChange" />
          </label>
        </div>
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Company Name"
          v-model="companyForm.name"
        />
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Email"
          v-model="companyForm.email"
        />
        <input
          class="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-[10px] text-white"
          placeholder="Phone"
          v-model="companyForm.phone"
        />

        <div class="flex gap-2 justify-end mt-4">
          <button
            @click="closeCompanyModal"
            class="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/20 transition-colors text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            @click="saveCompany"
            class="px-4 py-2 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors text-xs cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import type { Company } from '@/db'
import { updateCompany, createCompany } from '@/db/companyActions'
import { ref, toRaw, watch } from 'vue'

const props = defineProps<{
  showCompanyModal: boolean
  editingCompany?: Company
  onCompanyLogoChange: (e: Event) => void
  closeCompanyModal: () => void
}>()

const companyForm = ref<Omit<Company, 'id'>>({ name: '', email: '', phone: '', logoUrl: '' })

watch(
  () => props.editingCompany,
  () => {
    companyForm.value = {
      name: props.editingCompany?.name || '',
      email: props.editingCompany?.email || '',
      phone: props.editingCompany?.phone || '',
      logoUrl: props.editingCompany?.logoUrl || '',
    }
  },
)

async function saveCompany() {
  if (props.editingCompany) {
    await updateCompany(props.editingCompany.id, toRaw(companyForm.value))
  } else {
    await createCompany(companyForm.value)
  }

  companyForm.value = { name: '', email: '', phone: '', logoUrl: '' }
  props.closeCompanyModal()
}
</script>
