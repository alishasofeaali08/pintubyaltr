import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { User, ROLES, publicUser } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { signToken } from '../middleware/auth.js'
import { validateEmail, validatePhone, validateSignup } from '../validation.js'

const router = Router()

router.post('/signup', async (req, res, next) => {
  try {
    const { username, email, phone, password, ic } = req.body || {}
    const requestedRole = String(req.body?.role || 'Tenant')
    if (!['Tenant', 'Landlord', 'Property Manager'].includes(requestedRole)) return res.status(400).json({ error: 'Please select a valid account role.' })
    const error = validateSignup({ username, email, phone, password, ic })
    if (error) return res.status(400).json({ error })

    const cleanEmail = String(email).trim().toLowerCase()
    const name = String(username).trim()

    if (await User.exists({ email: cleanEmail })) {
      return res.status(409).json({ error: 'This email address is already registered.' })
    }
    if (await User.exists({ usernameKey: name.toLowerCase() })) {
      return res.status(409).json({ error: 'This username is already taken.' })
    }

    // The first account created in a fresh database becomes the admin.
    const role = (await User.countDocuments()) === 0 ? 'Admin' : requestedRole
    const user = await User.create({
      username: name,
      email: cleanEmail,
      phone: String(phone).trim(),
      ic: String(ic).trim(),
      passwordHash: await bcrypt.hash(password, 10),
      role,
    })

    return res.status(201).json({ token: signToken(user), user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const identifier = String(req.body?.identifier || '').trim().toLowerCase()
    const password = String(req.body?.password || '')
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please enter your username/email and password.' })
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { usernameKey: identifier }],
    }).select('+passwordHash')

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid username/email or password.' })
    }

    return res.json({ token: signToken(user), user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: publicUser(req.user) })
})

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body || {}

    if (name !== undefined) {
      const clean = String(name).trim()
      if (clean.length < 3) return res.status(400).json({ error: 'Name must contain at least 3 characters.' })
      const clash = await User.exists({ usernameKey: clean.toLowerCase(), _id: { $ne: req.user._id } })
      if (clash) return res.status(409).json({ error: 'This username is already taken.' })
      req.user.username = clean
    }

    if (email !== undefined) {
      const clean = String(email).trim().toLowerCase()
      const error = validateEmail(clean)
      if (error) return res.status(400).json({ error })
      const clash = await User.exists({ email: clean, _id: { $ne: req.user._id } })
      if (clash) return res.status(409).json({ error: 'This email address is already in use.' })
      req.user.email = clean
    }

    if (phone !== undefined) {
      const error = validatePhone(phone)
      if (error) return res.status(400).json({ error })
      req.user.phone = String(phone).trim()
    }

    if (role !== undefined) {
      if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role.' })
      if (role === 'Admin' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Admin privileges are required.' })
      }
      req.user.role = role
    }

    await req.user.save()
    return res.json({ user: publicUser(req.user) })
  } catch (error) {
    return next(error)
  }
})

export default router
