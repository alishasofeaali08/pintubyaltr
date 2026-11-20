import { useEffect, useState } from 'react'
import PageHeading from '../components/PageHeading'
import { getAnnouncements } from '../lib/announcements'
export default function Announcements() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { getAnnouncements().then(setItems).catch((err) => setError(err.message || 'Unable to load announcements.')) }, [])
  return <div className="container wide">
    <PageHeading title="Announcements" subtitle="Updates from the PINTU team." description="Important notices, campaigns and platform updates." />
    {error && <p className="form-message error">{error}</p>}
    {items.length === 0 && !error ? <div className="content-card"><p className="muted">There are no announcements at the moment.</p></div> : <div className="community-feed">
      {items.map((item) => <article className="content-card" key={item._id}>
        <small className="muted">{item.audience} · {new Date(item.createdAt).toLocaleString()}</small>
        <h2>{item.title}</h2><p style={{ whiteSpace: 'pre-wrap' }}>{item.content}</p><small className="muted">Posted by {item.authorName || 'PINTU Admin'}</small>
      </article>)}
    </div>}
  </div>
}
