import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { getMessages, sendMessage } from '../lib/messages'
import Modal from './Modal'

function conversationId(firstId, secondId) {
  const participants = [String(firstId), String(secondId)].sort()
  return `chat_${participants[0]}_${participants[1]}`
}

export default function ChatModal({ open, recipient, context, threadId: providedThreadId, onClose }) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [loaded, setLoaded] = useState({ threadId: null, messages: [] })
  const [error, setError] = useState('')
  const bottomRef = useRef(null)
  const threadId = providedThreadId || (recipient ? conversationId(user.id, recipient.id) : null)
  const messages = open && loaded.threadId === threadId ? loaded.messages : []

  useEffect(() => {
    if (!open || !threadId) return undefined
    let active = true
    getMessages(threadId)
      .then((items) => { if (active) setLoaded({ threadId, messages: items }) })
      .catch((err) => { if (active) setError(err.message) })
    return () => { active = false }
  }, [open, threadId])

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView()
  }, [open, messages.length])

  const submit = async (event) => {
    event.preventDefault()
    const text = message.trim()
    if (!text || !recipient || !threadId) return
    try {
      const created = await sendMessage({
        threadId,
        contextId: context?.postId || null,
        contextTitle: context?.title || '',
        receiverId: String(recipient.id),
        receiverName: recipient.name,
        text,
      })
      setLoaded((current) => ({
        threadId,
        messages: current.threadId === threadId ? [...current.messages, created] : [created],
      }))
      setMessage('')
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to send your message.')
    }
  }

  return (
    <Modal
      open={open}
      title={recipient?.name || 'Chat'}
      subtitle={context?.title || recipient?.role || 'Direct message'}
      onClose={onClose}
      className="chat-modal"
    >
      {recipient && (
        <>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-empty">Start the conversation by sending a message.</p>
            ) : (
              messages.map((item) => (
                <div className={`message ${String(item.senderId) === String(user.id) ? 'mine' : 'theirs'}`} key={item._id || item.id}>
                  {item.contextTitle && <small className="message-context">Re: {item.contextTitle}</small>}
                  <div>{item.text}</div>
                  <small>{new Date(item.date).toLocaleString()}</small>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
          {error && <p className="form-message error" role="alert">{error}</p>}
          <form className="chat-form" onSubmit={submit}>
            <input
              type="text"
              maxLength="1000"
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`Message ${recipient.name}...`}
              aria-label={`Message ${recipient.name}`}
            />
            <button type="submit" className="primary-btn">Send</button>
          </form>
        </>
      )}
    </Modal>
  )
}
