import { getToken } from './session'

// Same-origin "/api" when the built app is served by the Express server.
// Set VITE_API_URL when the client and API are deployed separately.
const configured = import.meta.env.VITE_API_URL
export const API_URL = (configured || (import.meta.env.DEV ? 'http://localhost:4000/api' : '/api')).replace(/\/$/, '')

async function request(method, path, { body, auth = true, params } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const token = getToken()
  if (auth && token) headers.Authorization = `Bearer ${token}`

  let url = `${API_URL}${path}`
  if (params) {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null),
    )
    if (query.toString()) url += `?${query}`
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Cannot reach the PINTU server. Start it with npm run dev and make sure MongoDB is running.')
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status}).`)
  }
  return payload
}

export const api = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
}
