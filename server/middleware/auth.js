import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { User } from '../models/User.js'

export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, username: user.username },
    config.jwtSecret,
    { expiresIn: '7d' },
  )
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : null
  if (!token) return res.status(401).json({ error: 'Please sign in to continue.' })

  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'Your account no longer exists.' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'Admin') {
    return res.status(403).json({ error: 'Admin privileges are required.' })
  }
  return next()
}

export function canPublishListings(user) {
  return ['Admin', 'Landlord', 'Property Manager'].includes(user?.role)
}
