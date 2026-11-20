import { api } from './api'
export async function getRentalRecords() {
  const { records } = await api.get('/rentals')
  return Array.isArray(records) ? records : []
}
export async function getRentalTenants() {
  const { tenants } = await api.get('/rentals/tenants')
  return Array.isArray(tenants) ? tenants : []
}
export async function createRentalRecord(record) {
  return (await api.post('/rentals', record)).record
}
export async function updateRentalRecord(id, updates) {
  return (await api.patch(`/rentals/${id}`, updates)).record
}
