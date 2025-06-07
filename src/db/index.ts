// src/db.ts
import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'
import { generateUniqueInvoiceCode } from './invoiceActions'

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

// LocalDB.version(1).stores({
//   clients: '@id, name',
//   invoices: '@id, code, clientId, status, dueDate, issueDate',
//   receipts: '@id, invoiceId, paymentDate',
// })
LocalDB.version(1).stores({
  clients: '++id, name',
  invoices: '++id, clientId, status, dueDate, issueDate',
  receipts: '++id, invoiceId, paymentDate',
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

if (!import.meta.env.VITE_DEXIE_DB_URL) {
  throw new Error('VITE_DEXIE_DB_URL environment variable is not defined')
}
// --- Configure Cloud (must be before migration) ---
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_DB_URL,
  customLoginGui: true,
  // requireAuth: true,
})
const currentUser = db.cloud.currentUser
const login = () => db.cloud.login()
const logout = () => db.cloud.logout()

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

    // Exit early if all local tables are empty (no migration needed)
    if (
      (!localClients || localClients.length === 0) &&
      (!localInvoices || localInvoices.length === 0) &&
      (!localReceipts || localReceipts.length === 0)
    ) {
      localStorage.setItem(MIGRATION_FLAG, 'true')
      console.info('✅ No local data to migrate. Migration marked as complete.')
      return
    }

    // Prepare invoices: ensure 'code' exists and handle 'id' for cloud
    const preparedInvoices = await Promise.all(
      localInvoices.map(async (inv) => {
        let code = inv.code
        if (!code) {
          code = await generateUniqueInvoiceCode()
        }
        // For Dexie Cloud, '@id' is auto-generated if not present, so remove 'id' if not string or not present
        const id = inv.id
        if (!id || typeof id !== 'string' || id.startsWith('++')) {
          // If id is invalid, remove it so it won't be included in the object
          const { id: _, ...rest } = inv
          return { ...rest, code }
        }
        return { ...inv, code, id }
      }),
    )

    // Upsert using bulkPut (replaces existing items with same id)
    await Promise.all([
      db.clients.bulkPut(localClients),
      db.invoices.bulkPut(preparedInvoices),
      db.receipts.bulkPut(localReceipts),
    ])

    localStorage.setItem(MIGRATION_FLAG, 'true')
    console.info('✅ Local data successfully migrated to Dexie Cloud')
    // Clear all data from LocalDB after successful migration
    await Promise.all([LocalDB.clients.clear(), LocalDB.invoices.clear(), LocalDB.receipts.clear()])
  } catch (err) {
    console.error('❌ Cloud migration failed:', err)
  }
}

// --- Run Migration on Startup ---
migrateLocalDataToCloud()

// --- Export ---
export { db, currentUser, login, logout }
export type { Client, Invoice, Receipt, InvoiceItem }
