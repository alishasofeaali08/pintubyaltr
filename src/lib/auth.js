import { api } from './api'
import { cacheUser, clearSession, getCachedUser, getToken, setSession } from './session'

export function validateSignup({ username, email, phone, password, repeatPassword, ic }) {
  if (!username || !email || !phone || !password || !repeatPassword || !ic) {
    return 'Please complete all required fields.'
  }
  if (username.length < 3) return 'Username must contain at least 3 characters.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.'
  if (!/^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/.test(phone)) {
    return 'Please enter a valid Malaysian phone number.'
  }
  if (password.length < 8) return 'Password must contain at least 8 characters.'
  if (password !== repeatPassword) return 'Passwords do not match.'
  if (!/^\d{6}-\d{2}-\d{4}$/.test(ic)) return 'Please enter your IC in this format: 000000-00-0000.'
  return null
}

export function getCurrentUser() {
  return getCachedUser()
}

export async function fetchCurrentUser() {
  if (!getToken()) return null
  const { user } = await api.get('/auth/me')
  cacheUser(user)
  return user
}

export async function signUp(form) {
  const error = validateSignup(form)
  if (error) throw new Error(error)

  const { user } = await api.post('/auth/signup', {
    username: form.username.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    password: form.password,
    ic: form.ic.trim(),
  }, { auth: false })
  return user
}

export async function signIn(identifier, password) {
  if (!identifier || !password) throw new Error('Please enter your username/email and password.')
  const { token, user } = await api.post('/auth/login', { identifier, password }, { auth: false })
  setSession(token, user)
  return user
}

export async function signOut() {
  clearSession()
}

export async function updateProfile(profile) {
  const { user } = await api.patch('/auth/me', profile)
  cacheUser(user)
  return user
}

export async function getUsers() {
  const { users } = await api.get('/users')
  return users
}

export async function adminUpdateUser(id, profile) {
  const { user } = await api.patch(`/users/${id}`, profile)
  return user
}

export async function deleteUser(id) {
  await api.delete(`/users/${id}`)
}
