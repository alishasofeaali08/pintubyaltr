import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Login() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice] = useState(
    location.state?.registered ? 'Registration successful! You can log in now.' : '',
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) navigate(location.state?.from || '/dashboard', { replace: true })
  }, [user, navigate, location.state])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(identifier.trim(), password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="container auth-container">
        <img className="auth-logo" src="/images/logo.png" alt="PINTU" />
        <h1>Welcome to PINTU!</h1>
        <h2>The Gateway to Better Property Living.</h2>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="loginUsername">👤</label>
            <input
              required
              type="text"
              name="username"
              id="loginUsername"
              placeholder="Username or email"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="loginPassword">🔒</label>
            <input
              required
              type="password"
              name="password"
              id="loginPassword"
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {notice && <p className="form-message success">{notice}</p>}
          {error && <p className="form-message error" role="alert">{error}</p>}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p>Don&apos;t have an account? Register via <Link to="/signup">click here</Link></p>
        <p className="auth-secondary"><Link to="/admin/login">Admin portal</Link></p>
      </div>
    </div>
  )
}
