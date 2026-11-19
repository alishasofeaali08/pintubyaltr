import { Router } from 'express'
import { Rating, ratingSummary } from '../models/Rating.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

router.get('/:userId', async (req, res, next) => {
  try {
    const userId = String(req.params.userId)
    const [summary, mine] = await Promise.all([
      ratingSummary(userId),
      Rating.findOne({ userId, raterId: String(req.user._id) }).select('value').lean(),
    ])
    return res.json({ summary, mine: mine?.value ?? null })
  } catch (error) {
    return next(error)
  }
})

router.post('/:userId', async (req, res, next) => {
  try {
    const userId = String(req.params.userId)
    const raterId = String(req.user._id)
    if (userId === raterId) return res.status(400).json({ error: 'You cannot rate yourself.' })

    const value = Number(req.body?.value)
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ error: 'Choose between 1 and 5 stars.' })
    }

    await Rating.findOneAndUpdate(
      { userId, raterId },
      { $set: { value, date: new Date() } },
      { upsert: true, returnDocument: 'after', runValidators: true },
    )

    return res.json({ summary: await ratingSummary(userId), mine: value })
  } catch (error) {
    return next(error)
  }
})

export default router
