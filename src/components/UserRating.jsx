import { useEffect, useState } from 'react'
import { useAuth } from '../context/useAuth'
import { getRating, rateUser, RATINGS_EVENT } from '../lib/ratings'

export default function UserRating({ userId, name = 'this user', compact = false, allowRating = true }) {
  const { user } = useAuth()
  const [data, setData] = useState({ summary: { count: 0, average: 0 }, mine: null })
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  useEffect(() => {
    if (!userId) return undefined
    let active = true
    getRating(userId)
      .then((result) => { if (active) setData(result) })
      .catch(() => {})
    return () => { active = false }
  }, [userId, user?.id, version])

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1)
    window.addEventListener(RATINGS_EVENT, refresh)
    return () => window.removeEventListener(RATINGS_EVENT, refresh)
  }, [])

  const submit = async (value) => {
    try {
      const result = await rateUser(userId, value)
      setData({ summary: result.summary, mine: result.mine })
      setError('')
    } catch (err) {
      setError(err.message || 'Unable to submit your rating.')
    }
  }

  const { summary, mine } = data
  const isSelf = String(userId) === String(user?.id)

  return (
    <div className={`user-rating${compact ? ' compact' : ''}`}>
      <span className="rating-summary" title={`${summary.count} rating${summary.count === 1 ? '' : 's'}`}>
        <span className="rating-star filled" aria-hidden="true">★</span>
        <strong>{summary.count ? summary.average.toFixed(1) : 'New'}</strong>
        <small>({summary.count})</small>
      </span>
      {allowRating && !isSelf && (
        <span className="rating-stars" role="group" aria-label={`Rate ${name}`}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              className={`rating-star${mine >= value ? ' filled' : ''}`}
              onClick={() => submit(value)}
              aria-label={`Rate ${name} ${value} star${value === 1 ? '' : 's'}`}
              aria-pressed={mine === value}
              title={`${value} star${value === 1 ? '' : 's'}`}
            >
              ★
            </button>
          ))}
        </span>
      )}
      {error && <small className="rating-error" role="alert">{error}</small>}
    </div>
  )
}
