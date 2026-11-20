import { api } from './api'
export async function getAnnouncements() {
  const { announcements } = await api.get('/announcements')
  return announcements || []
}
export async function createAnnouncement(details) {
  const { announcement } = await api.post('/announcements', details)
  return announcement
}
export async function deleteAnnouncement(id) {
  await api.delete(`/announcements/${id}`)
}
