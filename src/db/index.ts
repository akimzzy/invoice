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

interface Invoice {
  id: string
  code: string
  clientId?: string
  items: InvoiceItem[]
  total: number
  status: 'paid' | 'unpaid'
  issueDate: string
  dueDate?: string
  receiptId?: number
}

interface Receipt {
  id: string
  invoiceId: string
  paymentDate: string
  amountPaid: number
  paymentMethod: string
}

// --- Local DB (offline copy) ---
const LocalDB = new Dexie('InvoiceAppDB') as Dexie & {
  clients: EntityTable<Client, 'id'>
  invoices: EntityTable<Invoice, 'id'>
  receipts: EntityTable<Receipt, 'id'>
}

LocalDB.version(1).stores({
  clients: '@id, name',
  invoices: '@id, code, clientId, status, dueDate, issueDate',
  receipts: '@id, invoiceId, paymentDate',
})

// --- Cloud DB ---
const db = new Dexie('InvoiceAppDB', { addons: [dexieCloud] }) as Dexie & {
  clients: EntityTable<Client, 'id'>
  invoices: EntityTable<Invoice, 'id'>
  receipts: EntityTable<Receipt, 'id'>
}

db.version(1).stores({
  clients: '@id, name',
  invoices: '@id, code, clientId, status, dueDate, issueDate',
  receipts: '@id, invoiceId, paymentDate',
})

// --- Configure Cloud (must be before migration) ---
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_DB_URL,
  // requireAuth: true,
})

// --- Migration Routine ---
async function migrateLocalDataToCloud(): Promise<void> {
  const MIGRATION_FLAG = 'cloudMigrationDoneV1'
  if (localStorage.getItem(MIGRATION_FLAG)) return

  try {
    const [localClients, localInvoices, localReceipts] = await Promise.all([
      LocalDB.clients.toArray(),
      LocalDB.invoices.toArray(),
      LocalDB.receipts.toArray(),
    ])

    // Upsert using bulkPut (replaces existing items with same id)
    await Promise.all([
      db.clients.bulkPut(localClients),
      db.invoices.bulkPut(localInvoices),
      db.receipts.bulkPut(localReceipts),
    ])

    localStorage.setItem(MIGRATION_FLAG, 'true')
    console.info('✅ Local data successfully migrated to Dexie Cloud')
  } catch (err) {
    console.error('❌ Cloud migration failed:', err)
  }
}

// --- Run Migration on Startup ---
migrateLocalDataToCloud()

// --- Export ---
export { db }
export type { Client, Invoice, Receipt, InvoiceItem }
