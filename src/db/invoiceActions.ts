import { useNotification } from '@/composables/useNotification'
import { db } from '.'
import type { Invoice, InvoiceItem } from '.'

const { notify } = useNotification()

// Helper to generate a unique 4-digit code
export async function generateUniqueInvoiceCode(): Promise<string> {
  let code: string
  let exists: Invoice | undefined
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString()
    exists = await db.invoices.where('code').equals(code).first()
  } while (exists)
  return code
}

// Create a new invoice
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'code'>): Promise<string> {
  const code = await generateUniqueInvoiceCode()
  return db.invoices.add({ ...invoice, code })
}

// Fetch a single invoice by ID
export async function fetchInvoice(id: string): Promise<Invoice | undefined> {
  return db.invoices.get(id)
}

// Update an invoice by ID
export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<string> {
  const updated = await db.invoices.update(id, updates)
  notify({ message: `Invoice updated successfully`, type: 'success' })
  return String(updated)
}

export async function updateInvoiceItems(id: string, items: InvoiceItem[]): Promise<string> {
  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const updated = db.invoices.update(id, { items, total })
  return String(updated)
}

// Delete an invoice by ID
export async function deleteInvoice(id: string): Promise<void> {
  await db.invoices.delete(id)
  notify({ message: `Invoice deleted successfully`, type: 'success' })
}

// Fetch all invoices
export async function fetchAllInvoices(): Promise<Invoice[]> {
  return db.invoices.orderBy('issueDate').reverse().toArray()
}
