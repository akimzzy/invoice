<template>
  <div class="p-4">
    <button @click="generatePDF" class="mb-4 px-4 py-2 bg-blue-600 text-white rounded">
      Download PDF
    </button>

    <!-- Your A4 Invoice Component -->
    <div ref="pdfRef">
      <InvoiceA4Example />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import html2pdf from 'html2pdf.js'
import InvoiceA4Example from '@/components/InvoiceA4Example.vue'

const pdfRef = ref<HTMLElement | null>(null)

const generatePDF = async () => {
  const element = pdfRef.value
  if (!element) return

  const options = {
    margin: [0, 0, 0, 0], // mm
    filename: 'invoice.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      logging: false, // Reduces deprecated warnings
      useCORS: true, // Helps with image loading
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true,
    },
  }

  try {
    const worker = html2pdf().set(options)
    await worker.from(element).save()
  } catch (error) {
    console.error('Failed to generate PDF:', error)
  }
}
</script>
