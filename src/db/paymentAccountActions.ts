import { db } from '.'
import type { PaymentAccount } from '.'

// Create a new payment account
export async function createPaymentAccount(account: Omit<PaymentAccount, 'id'>): Promise<string> {
  return db.paymentAccounts.add(account)
}

// Fetch a single payment account by ID
export async function fetchPaymentAccount(id: string): Promise<PaymentAccount | undefined> {
  return db.paymentAccounts.get(id)
}

// Update a payment account by ID
export async function updatePaymentAccount(
  id: string,
  updates: Partial<PaymentAccount>,
): Promise<string> {
  const updated = await db.paymentAccounts.update(id, updates)
  return String(updated)
}

// Delete a payment account by ID
export async function deletePaymentAccount(id: string): Promise<void> {
  await db.paymentAccounts.delete(id)
}

// Fetch all payment accounts
export async function fetchAllPaymentAccounts(): Promise<PaymentAccount[]> {
  return db.paymentAccounts.toArray()
}
