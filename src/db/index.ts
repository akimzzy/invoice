// src/db.ts
import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

// --- Entity Interfaces ---
interface Client {
  id: string
  name: string
  email?: string
  phone?: string
}

interface InvoiceItem {
  description: string
  quantity: number
  rate: number
}

interface ReadonlyInvoice {
  id: string
  invoiceId: string
  invoiceSnapShot: Invoice
  autoUpdate: boolean
  updatedDate: string
  createdDate: string
}

interface Invoice {
  id: string
  code: string
  clientId?: string
  items: InvoiceItem[]
  total: number
  status: 'paid' | 'unpaid'
  issueDate: string
  updatedDate: string
  dueDate?: string
  receiptId?: number
  note?: string
  paymentAccountId?: string
  companyId?: string
  readonlyInvoiceId?: string
}

interface Company {
  id: string
  name: string
  logoUrl?: string
  email?: string
  phone?: string
}

interface PaymentAccount {
  id: string
  bank: string
  accountNumber: string
  accountName: string
}

// --- Cloud DB ---
const db = new Dexie('InvoiceAppDB', { addons: [dexieCloud] }) as Dexie & {
  clients: EntityTable<Client, 'id'>
  invoices: EntityTable<Invoice, 'id'>
  paymentAccounts: EntityTable<PaymentAccount, 'id'>
  companies: EntityTable<Company, 'id'>
  readonlyInvoices: EntityTable<ReadonlyInvoice, 'id'>
}

db.version(2).stores({
  clients: '@id, name',
  invoices: '@id, code, clientId, status, issueDate, updatedDate, dueDate',
  paymentAccounts: '@id, accountNumber',
  companies: '@id, name, email, phone',
  readonlyInvoices: '@id, invoiceId',
})

if (!import.meta.env.VITE_DEXIE_DB_URL) {
  throw new Error('VITE_DEXIE_DB_URL environment variable is not defined')
}
// --- Configure Cloud (must be before migration) ---
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_DB_URL,
  customLoginGui: true,
})

const currentUser = db.cloud.currentUser
const login = () => db.cloud.login()
const logout = () => db.cloud.logout()

// --- Export ---
export { db, currentUser, login, logout }
export type { Client, Invoice, InvoiceItem, Company, PaymentAccount, ReadonlyInvoice }
