import { useNotification } from '@/composables/useNotification'
import { db } from '.'
import type { Company } from '.'

const { notify } = useNotification()

// Create a new company
export async function createCompany(company: Omit<Company, 'id'>): Promise<string> {
  const res = await db.companies.add(company)
  notify({ message: `Company Added successfully`, type: 'success' })
  return res
}

// Fetch a single company by ID
export async function fetchCompany(id: string): Promise<Company | undefined> {
  return db.companies.get(id)
}

// Update a company by ID
export async function updateCompany(
  id: string,
  updates: Partial<Omit<Company, 'id'>>,
): Promise<string> {
  const updated = await db.companies.update(id, updates)
  notify({ message: `Company updated successfully`, type: 'success' })
  return String(updated)
}

// Delete a company by ID
export async function deleteCompany(id: string): Promise<void> {
  await db.companies.delete(id)
  notify({ message: 'Company deleted', type: 'success' })
}

// Fetch all companies
export async function fetchAllCompanies(): Promise<Company[]> {
  return db.companies.toArray()
}
