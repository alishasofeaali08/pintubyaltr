// User-wide ratings, stored in MongoDB. Anyone can rate another user once.

import { api } from './api'

export const RATINGS_EVENT = 'pintu:ratings'

export async function getRating(userId) {
  if (!userId) return { summary: { count: 0, average: 0 }, mine: null }
  const result = await api.get(`/ratings/${encodeURIComponent(userId)}`)
  return {
    summary: result.summary || { count: 0, average: 0 },
    mine: result.mine ?? null,
  }
}

export async function rateUser(userId, value) {
  const result = await api.post(`/ratings/${encodeURIComponent(userId)}`, { value })
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(RATINGS_EVENT, { detail: { userId: String(userId) } }))
  }
  return result
}
