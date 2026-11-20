import { Router } from 'express'
import { Story } from '../models/Story.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
function normalizeMedia(input) {
  if (!Array.isArray(input) || input.length > 1) throw new Error('A story can contain one image or video.')
  if (!input.length) return []
  const item = input[0]
  const type = item?.type, url = item?.url
  const max = type === 'video' ? 12_000_000 : 4_000_000
  if (!['image', 'video'].includes(type) || typeof url !== 'string' || !url.startsWith(`data:${type}/`) || url.length > max) {
    throw new Error('The story media is too large or unsupported.')
  }
  return [{ type, url }]
}
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 }).lean()
    res.json({ stories })
  } catch (error) { next(error) }
})
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const content = String(req.body?.content || '').trim()
    let media
    try { media = normalizeMedia(req.body?.media) } catch (error) { return res.status(400).json({ error: error.message }) }
    if (!content && !media.length) return res.status(400).json({ error: 'Add text or media to your story.' })
    const story = await Story.create({
      userId: String(req.user._id), author: req.user.username, role: req.user.role,
      content, media, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    res.status(201).json({ story })
  } catch (error) { next(error) }
})
export default router
