import { api } from './api'
export async function getMaintenanceRequests() {
  const { requests } = await api.get('/maintenance')
  return requests || []
}
export async function submitMaintenanceRequest(details) {
  const { request } = await api.post('/maintenance', details)
  return request
}
export async function updateMaintenanceRequest(id, details) {
  const { request } = await api.patch(`/maintenance/${id}`, details)
  return request
}
