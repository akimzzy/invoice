// src/db.ts
import Dexie, { type EntityTable } from 'dexie'

// --- Entity Interfaces ---
interface Client {
  id: number
  name: string
  email: string
  phone: string
}

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
}

interface Invoice {
  id: number
  clientId?: number
  items: InvoiceItem[]
  total: number
  status: 'paid' | 'unpaid'
  issueDate: string
  dueDate?: string
  receiptId?: number
}

interface Receipt {
  id: number
  invoiceId: number
  paymentDate: string
  amountPaid: number
  paymentMethod: string
}

// --- Dexie DB Instance with Typing via `EntityTable` ---
const db = new Dexie('InvoiceAppDB') as Dexie & {
  clients: EntityTable<Client, 'id'>
  invoices: EntityTable<Invoice, 'id'>
  receipts: EntityTable<Receipt, 'id'>
}

// --- Schema Declaration ---
db.version(1).stores({
  clients: '++id, name, email, phone',
  invoices: '++id, clientId, status, dueDate',
  receipts: '++id, invoiceId, paymentDate',
})

// --- Export ---
export { db }
export type { Client, Invoice, Receipt, InvoiceItem }
