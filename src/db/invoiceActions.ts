import { db } from '.'
import type { Invoice, InvoiceItem } from '.'

// Create a new invoice
export async function createInvoice(invoice: Omit<Invoice, 'id'>): Promise<number> {
  return db.invoices.add(invoice)
}

// Fetch a single invoice by ID
export async function fetchInvoice(id: number): Promise<Invoice | undefined> {
  return db.invoices.get(id)
}

// Update an invoice by ID
export async function updateInvoice(id: number, updates: Partial<Invoice>): Promise<number> {
  return db.invoices.update(id, updates)
}

export async function updateInvoiceItems(id: number, items: InvoiceItem[]): Promise<number> {
  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  return db.invoices.update(id, { items, total })
}

// Delete an invoice by ID
export async function deleteInvoice(id: number): Promise<void> {
  await db.invoices.delete(id)
}

// Fetch all invoices
export async function fetchAllInvoices(): Promise<Invoice[]> {
  return db.invoices.toArray()
}
