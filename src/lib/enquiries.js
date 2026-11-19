import { api } from './api'

export async function submitEnquiry(details) {
  const { enquiry } = await api.post('/enquiries', details, { auth: false })
  return enquiry
}
