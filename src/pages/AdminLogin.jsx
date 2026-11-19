import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function AdminLogin() {
  const { signIn, signOut } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await signIn(username.trim(), password)
      if (user.role !== 'Admin') {
        await signOut()
        throw new Error('Access denied. You do not have admin privileges.')
      }
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message || 'Admin login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-login-box">
        <img className="auth-logo" src="/images/logo.png" alt="PINTU" />
        <h1>🔐 Admin Portal</h1>
        <h2>PINTU Administration Access</h2>
        <form id="adminLoginForm" onSubmit={submit} className="stacked-form">
          <div className="auth-field">
            <label htmlFor="adminUsername">👤</label>
            <input id="adminUsername" required type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Admin Username" />
          </div>
          <div className="auth-field">
            <label htmlFor="adminPassword">🔒</label>
            <input id="adminPassword" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin Password" />
          </div>
          {error && <p className="form-message error" role="alert">{error}</p>}
          <button type="submit" className="primary-btn" disabled={loading}>{loading ? 'Signing in...' : 'Admin Login'}</button>
        </form>
        <p><Link to="/login">← Back to User Login</Link></p>
      </div>
    </div>
  )
}
