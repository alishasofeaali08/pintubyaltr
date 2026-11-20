import { Router } from 'express'
import { MaintenanceRequest } from '../models/MaintenanceRequest.js'
import { requireAuth } from '../middleware/auth.js'
const router = Router()
router.use(requireAuth)
router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'Tenant' ? { tenantId: String(req.user._id) } : {}
    const requests = await MaintenanceRequest.find(filter).sort({ createdAt: -1 }).lean()
    res.json({ requests })
  } catch (error) { next(error) }
})
router.post('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'Tenant') return res.status(403).json({ error: 'Only tenants can submit maintenance requests.' })
    const property = String(req.body?.property || '').trim()
    const category = String(req.body?.category || '').trim()
    const description = String(req.body?.description || '').trim()
    const unit = String(req.body?.unit || '').trim()
    const priority = ['Low', 'Normal', 'High', 'Urgent'].includes(req.body?.priority) ? req.body.priority : 'Normal'
    if (!property || !category || !description) return res.status(400).json({ error: 'Please complete the property, category and description.' })
    const request = await MaintenanceRequest.create({
      tenantId: String(req.user._id), tenantName: req.user.username, property, unit, category, description, priority,
    })
    res.status(201).json({ request })
  } catch (error) { next(error) }
})
router.patch('/:id', async (req, res, next) => {
  try {
    if (!['Admin', 'Landlord', 'Property Manager'].includes(req.user.role)) return res.status(403).json({ error: 'You cannot manage maintenance requests.' })
    const status = ['Submitted', 'In Progress', 'Completed', 'Rejected'].includes(req.body?.status) ? req.body.status : null
    if (!status) return res.status(400).json({ error: 'Invalid request status.' })
    const request = await MaintenanceRequest.findByIdAndUpdate(req.params.id, {
      status, managerNote: String(req.body?.managerNote || '').trim().slice(0, 1000),
    }, { new: true, runValidators: true })
    if (!request) return res.status(404).json({ error: 'Maintenance request not found.' })
    res.json({ request })
  } catch (error) { next(error) }
})
export default router
