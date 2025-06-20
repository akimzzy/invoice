<script setup lang="ts">
import { formatDate } from 'date-fns'
import { ref, onMounted, computed } from 'vue'
import type { Invoice, InvoiceItem } from '@/db'

interface CompanyInfo {
  name?: string
  email?: string
  phone?: string
}

const props = defineProps<{
  invoice: Invoice
  companyInfo?: CompanyInfo
}>()

const currentDate = formatDate(props.invoice.issueDate || new Date(), 'dd MMM yyyy')

const items = computed(() => props.invoice?.items || [])
const totalAmount = computed(() => {
  if (typeof props.invoice?.total === 'number') return props.invoice.total
  return items.value.reduce((sum, item) => sum + (item.rate ?? item.quantity * item.rate), 0)
})

const pages = ref<Array<InvoiceItem[]>>([])
const itemsHeight = 35 // Height per item row including padding and borders
const headerHeight = 90 // Header height including padding and border
const footerHeight = 60 // Footer height including padding and border
const a4Height = 297 * 2.83465 // A4 height in pixels
// const a4Width = 210 * 2.83465 // A4 width in pixels
const contentPadding = 30 // Content padding
const tablePadding = 12 // Table section padding
const tableHeaderHeight = 35 // Table header height
const availableHeight =
  a4Height - headerHeight - footerHeight - contentPadding - tablePadding - tableHeaderHeight

onMounted(() => {
  // Calculate items per page based on available height
  const itemsPerPage = Math.floor(availableHeight / itemsHeight)
  const pageCount = Math.ceil(items.value.length / itemsPerPage)

  // Create pages with proper item distribution
  pages.value = Array.from({ length: pageCount }, (_, i) => {
    const start = i * itemsPerPage
    return items.value.slice(start, start + itemsPerPage)
  })
})

const invoiceNumber = computed(() =>
  props.invoice?.code ? `Invoice #${props.invoice.code}` : 'Invoice',
)
</script>

<template>
  <div v-for="(pageItems, index) in pages" :key="index" class="a4-container">
    <div class="a4-page invoice-a4">
      <!-- Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="company-info">
            <h1>{{ invoiceNumber }}</h1>
            <div class="company-contact">
              <p>{{ currentDate }}</p>
            </div>
          </div>
          <div class="company-info" v-if="props.companyInfo">
            <h1>{{ props.companyInfo.name }}</h1>
            <div class="company-contact">
              <p>{{ props.companyInfo.email }}</p>
              <p>{{ props.companyInfo.phone }}</p>
            </div>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main>
        <!-- Items Table -->
        <div class="items-section">
          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in pageItems" :key="item.description">
                <td>{{ item.description }}</td>
                <td>{{ item.quantity }}</td>
                <td>₦{{ item.rate.toLocaleString() }}</td>
                <td>₦{{ (item.rate ?? item.quantity * item.rate).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Total (only show on last page) -->
        <div v-if="index === pages.length - 1" class="total-section">
          <div class="total-content">
            <div class="total">
              <span>Total:</span>
              <span>₦{{ totalAmount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer>
        <p>If you have any questions about this invoice, please contact us</p>
        <p>{{ currentDate }} - Generated by Invoice System</p>
        <div class="page-number">Page {{ index + 1 }} of {{ pages.length }}</div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
h1 {
  font-size: 1rem;
  font-weight: 600;
}

.a4-container {
  width: 210mm;
  height: 297mm;
  margin: 0 auto;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    Liberation Mono,
    Courier New,
    monospace;
}

.a4-page {
  width: 180mm;
  height: 254mm;
  box-sizing: border-box;
  position: relative;
  background-color: white;
  color: black;
  margin: auto;
  page-break-after: always;
  max-width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.invoice-a4 {
  color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
}

.page-header {
  padding: 0.75rem;
  border-bottom: 1px solid #e5e5e5;
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 100%;
}

main {
  padding: 0.75rem;
  flex: 1;
  width: 100%;
}

.items-section {
  margin-bottom: 1rem;
  width: 100%;
  overflow-x: auto;
}

.items-section h3 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 0.7rem 0.25rem;
  font-size: 0.7rem;
}

th {
  font-weight: 600;
  text-align: left;
  background-color: #f8f8f8;
}

th:not(:first-child),
td:not(:first-child) {
  text-align: right;
}

tbody tr {
  border-bottom: 1px solid #e5e5e5;
}

.total-section {
  display: flex;
  justify-content: flex-end;
  margin: 1rem 0;
}

.total-content {
  width: 33.333%;
}

.total {
  display: flex;
  justify-content: space-between;
  padding: 0.375rem 0;
  font-weight: bold;
  font-size: 0.875rem;
}

footer {
  text-align: center;

  font-size: 0.7rem;
  color: #666;
  background-color: white;

  padding: 0.75rem;
  border-top: 1px solid #e5e5e5;
  width: 100%;
}

.page-number {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  color: #999;
}

.company-contact {
  display: flex;
  font-size: 0.7rem;
  color: #666;
}
</style>
