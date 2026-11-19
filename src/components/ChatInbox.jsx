import { useEffect, useState } from 'react'
import { CloseIcon, MessageIcon } from './Icons'
import { getChatThreads, MESSAGES_EVENT } from '../lib/messages'

function initials(name) {
  return (name || 'P').charAt(0).toUpperCase()
}

function shortDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'now'
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}d`
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default function ChatInbox({ onSelect }) {
  const [open, setOpen] = useState(false)
  const [threads, setThreads] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = () => {
      getChatThreads()
        .then((items) => { if (active) setThreads(items) })
        .catch((err) => { if (active) setError(err.message) })
    }
    load()
    window.addEventListener(MESSAGES_EVENT, load)
    return () => {
      active = false
      window.removeEventListener(MESSAGES_EVENT, load)
    }
  }, [])

  return (
    <div className="chat-inbox">
      <button
        type="button"
        className="chat-inbox-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close chats' : 'Open chats'}
        aria-expanded={open}
        title="Chats"
      >
        <MessageIcon />
        {threads.length > 0 && <span className="chat-inbox-badge">{threads.length}</span>}
      </button>

      {open && (
        <aside className="chat-inbox-panel" aria-label="Chat list">
          <header className="chat-inbox-header">
            <div>
              <h2>Messages</h2>
              <p>Your conversations</p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chats">
              <CloseIcon />
            </button>
          </header>

          {error && <p className="form-message error" role="alert">{error}</p>}

          <div className="chat-inbox-list">
            {threads.length === 0 ? (
              <div className="chat-inbox-empty">
                <MessageIcon />
                <strong>No chats yet</strong>
                <p>Message a seller from a post or property listing to start a conversation.</p>
              </div>
            ) : threads.map((thread) => (
              <button
                type="button"
                className="chat-thread"
                key={thread.id}
                onClick={() => {
                  onSelect({
                    id: thread.participantId,
                    name: thread.participantName,
                    postId: thread.contextId,
                    title: thread.contextTitle,
                    threadId: thread.threadId,
                  })
                  setOpen(false)
                }}
              >
                <span className="story-avatar">{initials(thread.participantName)}</span>
                <span className="chat-thread-body">
                  <span className="chat-thread-top">
                    <strong>{thread.participantName}</strong>
                    <small>{shortDate(thread.lastDate)}</small>
                  </span>
                  {thread.contextTitle && <small className="chat-thread-context">Re: {thread.contextTitle}</small>}
                  <small className="chat-thread-preview">{thread.lastMessage}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}
