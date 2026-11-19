import { api } from './api'

export const MESSAGES_EVENT = 'pintu:messages'

export async function getMessages(threadId) {
  if (!threadId) return []
  const { messages } = await api.get('/messages', { params: { threadId } })
  return Array.isArray(messages) ? messages : []
}

export async function getChatThreads() {
  const { threads } = await api.get('/messages/threads')
  return Array.isArray(threads) ? threads : []
}

export async function sendMessage(details) {
  const { message } = await api.post('/messages', details)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MESSAGES_EVENT, { detail: { threadId: details.threadId } }))
  }
  return message
}
