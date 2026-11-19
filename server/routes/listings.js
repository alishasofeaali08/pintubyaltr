import { Router } from 'express'
import { Listing } from '../models/Listing.js'
import { canPublishListings, requireAuth } from '../middleware/auth.js'

const router = Router()
const EDITABLE = [
  'title', 'type', 'price', 'location', 'bedrooms',
  'bathrooms', 'furnishing', 'description', 'image',
]

function pickFields(body) {
  const fields = {}
  for (const key of EDITABLE) {
    if (body?.[key] !== undefined) fields[key] = body[key]
  }
  return fields
}

function validate(fields) {
  if (!fields.title?.trim() || !fields.type || !fields.location?.trim() || !fields.description?.trim()) {
    return 'Please complete all required property details.'
  }
  if (!Number.isFinite(Number(fields.price)) || Number(fields.price) <= 0) {
    return 'Please enter a valid monthly rental.'
  }
  return null
}

router.get('/', async (req, res, next) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).lean()
    return res.json({ listings: listings.map((item) => ({ ...item, id: String(item._id) })) })
  } catch (error) {
    return next(error)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    if (!canPublishListings(req.user)) {
      return res.status(403).json({ error: 'Only landlords and property managers can publish property listings.' })
    }
    const fields = pickFields(req.body)
    const error = validate(fields)
    if (error) return res.status(400).json({ error })

    const listing = await Listing.create({
      ...fields,
      price: Number(fields.price),
      bedrooms: Number(fields.bedrooms) || 0,
      bathrooms: Number(fields.bathrooms) || 0,
      ownerId: String(req.user._id),
      ownerName: req.user.username,
      ownerRole: req.user.role,
    })
    return res.status(201).json({ listing: { ...listing.toObject({ virtuals: true }), id: String(listing._id) } })
  } catch (error) {
    return next(error)
  }
})

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ error: 'Property listing not found.' })
    if (String(listing.ownerId) !== String(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'You can only edit your own property listings.' })
    }

    const fields = pickFields(req.body)
    const error = validate(fields)
    if (error) return res.status(400).json({ error })
    Object.assign(listing, fields, { updatedAt: new Date() })
    await listing.save()
    return res.json({ listing: { ...listing.toObject({ virtuals: true }), id: String(listing._id) } })
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id)
    if (!listing) return res.status(404).json({ error: 'Property listing not found.' })
    if (String(listing.ownerId) !== String(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'You can only delete your own property listings.' })
    }
    await listing.deleteOne()
    return res.json({ ok: true })
  } catch (error) {
    return next(error)
  }
})

export default router
