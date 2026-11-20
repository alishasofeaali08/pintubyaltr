import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../lib/auth'

const emptyForm = { username: '', email: '', phone: '', password: '', repeatPassword: '', ic: '', role: 'Tenant' }
const fields = [
  { name: 'username', id: 'username-input', icon: '👤', type: 'text', placeholder: 'username', autoComplete: 'username' },
  { name: 'email', id: 'email-input', icon: '📧', type: 'email', placeholder: 'Email', autoComplete: 'email' },
  { name: 'phone', id: 'phone-number-input', icon: '📞', type: 'tel', placeholder: 'Phone Number', autoComplete: 'tel' },
  { name: 'password', id: 'password-input', icon: '🔒', type: 'password', placeholder: 'Password', autoComplete: 'new-password' },
  { name: 'repeatPassword', id: 'repeat-password-input', icon: '🔒', type: 'password', placeholder: 'Repeat Password', autoComplete: 'new-password' },
  { name: 'ic', id: 'IC-input', icon: '🆔', type: 'text', placeholder: 'eg: 000000-00-0000' },
]
export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const onChange = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }))
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true)
    try { await signUp(form); navigate('/login', { replace: true, state: { registered: true } }) }
    catch (err) { setError(err.message || 'Registration failed.') }
    finally { setLoading(false) }
  }
  return (
    <div className="auth-page"><div className="container auth-container">
      <img className="auth-logo" src="/images/logo.png" alt="PINTU" />
      <h1>Welcome to PINTU!</h1><h2>The Gateway to Better Property Living.</h2>
      <form id="registerForm" onSubmit={handleSubmit}>
        {fields.map((field) => <div className="auth-field" key={field.name}>
          <label htmlFor={field.id}>{field.icon}</label>
          <input required type={field.type} name={field.name} id={field.id} placeholder={field.placeholder} autoComplete={field.autoComplete} value={form[field.name]} onChange={onChange} />
        </div>)}
        <div className="auth-field">
          <label htmlFor="signup-role">🏠</label>
          <select required id="signup-role" name="role" value={form.role} onChange={onChange} aria-label="Account role">
            <option value="Tenant">Tenant</option><option value="Landlord">Landlord</option><option value="Property Manager">Property Manager</option>
          </select>
        </div>
        {error && <p className="form-message error" role="alert">{error}</p>}
        <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
      </form>
      <p>Already have an account? Log in <Link to="/login">click here</Link></p>
    </div></div>
  )
}
