const TOKEN_KEY = 'pintuToken'
const USER_KEY = 'pintuCurrentUser'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  cacheUser(user)
}

export function cacheUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getCachedUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  for (const key of [TOKEN_KEY, USER_KEY, 'savedUsername', 'savedEmail', 'savedPhone', 'isAdminLoggedIn']) {
    localStorage.removeItem(key)
  }
}
