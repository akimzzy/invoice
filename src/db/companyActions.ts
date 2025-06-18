import { db } from '.'
import type { Company } from '.'

// Create a new company
export async function createCompany(company: Omit<Company, 'id'>): Promise<string> {
  return db.companies.add(company)
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
  return String(updated)
}

// Delete a company by ID
export async function deleteCompany(id: string): Promise<void> {
  await db.companies.delete(id)
}

// Fetch all companies
export async function fetchAllCompanies(): Promise<Company[]> {
  return db.companies.toArray()
}
