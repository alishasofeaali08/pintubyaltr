import { Router } from 'express'
import { User, TIER_NAMES, publicUser } from '../models/User.js'
import { Transaction } from '../models/Transaction.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { PAYMENT_METHODS } from './paymentMethods.js'

const router = Router()
const TIER_PRICES = { Bronze: 0, Silver: 19.9, Gold: 39.9, Platinum: 69.9 }

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 100)
    const [user, transactions] = await Promise.all([
      User.findById(req.user._id),
      Transaction.find({ userId: String(req.user._id) }).sort({ date: -1 }).limit(limit).lean(),
    ])
    return res.json({ balance: user.wallet, transactions })
  } catch (error) {
    return next(error)
  }
})

router.post('/topup', requireAuth, async (req, res, next) => {
  try {
    const amount = Number(req.body?.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Enter a valid amount.' })
    }
    if (amount > 1000) return res.status(400).json({ error: 'You can add at most RM1,000 at a time.' })

    const user = await User.findById(req.user._id)
    user.wallet = Math.round((user.wallet + amount) * 100) / 100
    await user.save()
    await Transaction.create({
      userId: String(user._id),
      userName: user.username,
      type: 'top-up',
      amount,
      method: PAYMENT_METHODS.includes(req.body?.method) ? req.body.method : 'Dashboard wallet top-up',
    })
    return res.json({ balance: user.wallet })
  } catch (error) {
    return next(error)
  }
})

router.post('/upgrade', requireAuth, async (req, res, next) => {
  try {
    const tier = req.body?.tier
    if (!TIER_NAMES.includes(tier)) return res.status(400).json({ error: 'Invalid membership tier.' })

    const user = await User.findById(req.user._id)
    const amount = Math.max(0, TIER_PRICES[tier] - TIER_PRICES[user.tier])
    if (amount > user.wallet) {
      return res.status(400).json({
        error: `Insufficient balance. You need RM${amount.toFixed(2)} but have RM${user.wallet.toFixed(2)}.`,
      })
    }

    user.wallet = Math.round((user.wallet - amount) * 100) / 100
    user.tier = tier
    await user.save()
    if (amount > 0) {
      await Transaction.create({
        userId: String(user._id),
        userName: user.username,
        type: 'upgrade',
        tier,
        amount,
      })
    }
    return res.json({ user: publicUser(user), balance: user.wallet })
  } catch (error) {
    return next(error)
  }
})

router.get('/transactions', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 }).lean()
    return res.json({ transactions })
  } catch (error) {
    return next(error)
  }
})

export default router
