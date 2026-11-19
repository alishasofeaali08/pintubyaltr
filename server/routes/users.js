import { Router } from 'express'
import { User, ROLES, TIER_NAMES, publicUser } from '../models/User.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { Listing } from '../models/Listing.js'
import { Post } from '../models/Post.js'
import { Message } from '../models/Message.js'
import { Rating } from '../models/Rating.js'
import { Transaction } from '../models/Transaction.js'
import { validateEmail, validatePhone } from '../validation.js'

const router = Router()
router.use(requireAuth, requireAdmin)

router.get('/', async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean()
    return res.json({ users: users.map(publicUser) })
  } catch (error) {
    return next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    const { name, email, phone, role, tier } = req.body || {}

    if (name !== undefined) {
      const clean = String(name).trim()
      if (clean.length < 3) return res.status(400).json({ error: 'Name must contain at least 3 characters.' })
      const clash = await User.exists({ usernameKey: clean.toLowerCase(), _id: { $ne: user._id } })
      if (clash) return res.status(409).json({ error: 'This username is already taken.' })
      user.username = clean
    }
    if (email !== undefined) {
      const clean = String(email).trim().toLowerCase()
      const error = validateEmail(clean)
      if (error) return res.status(400).json({ error })
      const clash = await User.exists({ email: clean, _id: { $ne: user._id } })
      if (clash) return res.status(409).json({ error: 'This email address is already in use.' })
      user.email = clean
    }
    if (phone !== undefined) {
      const error = validatePhone(phone)
      if (error) return res.status(400).json({ error })
      user.phone = String(phone).trim()
    }
    if (role !== undefined) {
      if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role.' })
      user.role = role
    }
    if (tier !== undefined) {
      if (!TIER_NAMES.includes(tier)) return res.status(400).json({ error: 'Invalid membership tier.' })
      user.tier = tier
    }

    await user.save()
    return res.json({ user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id)
    if (id === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot delete your own admin account.' })
    }
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ error: 'User not found.' })

    await Promise.all([
      Listing.deleteMany({ ownerId: id }),
      Post.deleteMany({ userId: id }),
      Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] }),
      Rating.deleteMany({ $or: [{ userId: id }, { raterId: id }] }),
      Transaction.deleteMany({ userId: id }),
      user.deleteOne(),
    ])

    return res.json({ ok: true })
  } catch (error) {
    return next(error)
  }
})

export default router
