import { Router } from 'express'
import { Announcement } from '../models/Announcement.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
const router = Router()
router.use(requireAuth)
router.get('/', async (req, res, next) => {
  try {
    const audience = req.user?.role
    const allowed = req.user.role === 'Admin' ? ['Everyone', 'Tenants', 'Landlords', 'Property Managers'] : ['Everyone']
    if (audience === 'Tenant') allowed.push('Tenants')
    if (audience === 'Landlord') allowed.push('Landlords')
    if (audience === 'Property Manager') allowed.push('Property Managers')
    const announcements = await Announcement.find({ published: true, audience: { $in: allowed } }).sort({ createdAt: -1 }).lean()
    res.json({ announcements })
  } catch (error) { next(error) }
})
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const title = String(req.body?.title || '').trim()
    const content = String(req.body?.content || '').trim()
    const audience = ['Everyone', 'Tenants', 'Landlords', 'Property Managers'].includes(req.body?.audience) ? req.body.audience : 'Everyone'
    if (!title || !content) return res.status(400).json({ error: 'Title and announcement content are required.' })
    const announcement = await Announcement.create({ title, content, audience, authorId: String(req.user._id), authorName: req.user.username })
    res.status(201).json({ announcement })
  } catch (error) { next(error) }
})
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const result = await Announcement.findByIdAndDelete(req.params.id)
    if (!result) return res.status(404).json({ error: 'Announcement not found.' })
    res.json({ ok: true })
  } catch (error) { next(error) }
})
export default router
