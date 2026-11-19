const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^(\+?6?01)[0-46-9]-?[0-9]{7,8}$/
const IC = /^\d{6}-\d{2}-\d{4}$/

export function validateSignup({ username, email, phone, password, ic }) {
  if (!username || !email || !phone || !password || !ic) {
    return 'Please complete all required fields.'
  }
  if (String(username).trim().length < 3) return 'Username must contain at least 3 characters.'
  if (!EMAIL.test(String(email).trim())) return 'Please enter a valid email address.'
  if (!PHONE.test(String(phone).trim())) return 'Please enter a valid Malaysian phone number.'
  if (String(password).length < 8) return 'Password must contain at least 8 characters.'
  if (!IC.test(String(ic).trim())) return 'Please enter your IC in this format: 000000-00-0000.'
  return null
}

export function validateEmail(value) {
  return EMAIL.test(String(value || '').trim()) ? null : 'Please enter a valid email address.'
}

export function validatePhone(value) {
  if (!value) return null
  return PHONE.test(String(value).trim()) ? null : 'Please enter a valid Malaysian phone number.'
}
