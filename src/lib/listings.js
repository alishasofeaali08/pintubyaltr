import { api } from './api'

export async function getListings() {
  const { listings } = await api.get('/listings')
  return Array.isArray(listings) ? listings : []
}

export async function createListing(details) {
  const { listing } = await api.post('/listings', details)
  return listing
}

export async function updateListing(id, details) {
  const { listing } = await api.patch(`/listings/${id}`, details)
  return listing
}

export async function deleteListing(id) {
  await api.delete(`/listings/${id}`)
}
