import { Router } from 'express'
import { RentalPayment } from '../models/RentalPayment.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)
const managerRoles = ['Admin', 'Landlord', 'Property Manager']

router.get('/', async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : req.user.role === 'Tenant'
      ? { tenantId: String(req.user._id) }
      : { managerId: String(req.user._id) }
    const records = await RentalPayment.find(filter).sort({ month: -1, dueDate: 1 }).lean()
    res.json({ records })
  } catch (error) { next(error) }
})

router.get('/tenants', async (req, res, next) => {
  try {
    if (!managerRoles.includes(req.user.role)) return res.status(403).json({ error: 'Only landlords and property managers can select tenants.' })
    const tenants = await User.find({ role: 'Tenant' }).select('_id username email').sort({ username: 1 }).lean()
    res.json({ tenants: tenants.map((tenant) => ({ id: String(tenant._id), name: tenant.username, email: tenant.email })) })
  } catch (error) { next(error) }
})

router.post('/', async (req, res, next) => {
  try {
    if (!managerRoles.includes(req.user.role)) return res.status(403).json({ error: 'Only landlords and property managers can add rental records.' })
    const tenantId = String(req.body?.tenantId || '').trim()
    const property = String(req.body?.property || '').trim()
    const month = String(req.body?.month || '')
    const amount = Number(req.body?.amount)
    const dueDate = new Date(req.body?.dueDate)
    if (!tenantId || !property || !/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(amount) || amount <= 0 || Number.isNaN(dueDate.getTime())) {
      return res.status(400).json({ error: 'Enter a tenant, property, month, valid rent amount and due date.' })
    }
    const tenant = await User.findById(tenantId)
    if (!tenant || tenant.role !== 'Tenant') return res.status(400).json({ error: 'Select a valid tenant account.' })
    const record = await RentalPayment.create({
      tenantId, tenantName: tenant.username, managerId: String(req.user._id), managerName: req.user.username,
      property, unit: String(req.body?.unit || '').trim(), month, amount: Math.round(amount * 100) / 100, dueDate,
    })
    res.status(201).json({ record })
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'A rental record already exists for this tenant, property and month.' })
    next(error)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    if (!managerRoles.includes(req.user.role)) return res.status(403).json({ error: 'Only landlords and property managers can update rental records.' })
    const status = ['Pending', 'Paid', 'Overdue'].includes(req.body?.status) ? req.body.status : null
    if (!status) return res.status(400).json({ error: 'Select a valid payment status.' })
    const filter = req.user.role === 'Admin' ? { _id: req.params.id } : { _id: req.params.id, managerId: String(req.user._id) }
    const record = await RentalPayment.findOneAndUpdate(filter, { status }, { new: true, runValidators: true })
    if (!record) return res.status(404).json({ error: 'Rental record not found.' })
    res.json({ record })
  } catch (error) { next(error) }
})

export default router
