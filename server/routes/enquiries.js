import { Router } from 'express'
import { Enquiry } from '../models/Enquiry.js'
import { validateEmail } from '../validation.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { name, email, role, subject, message, userId } = req.body || {}
    if (!name?.trim() || !email?.trim() || !subject || !message?.trim()) {
      return res.status(400).json({ error: 'Please complete all required fields.' })
    }
    const error = validateEmail(email)
    if (error) return res.status(400).json({ error })

    const enquiry = await Enquiry.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      role: role || '',
      subject: String(subject),
      message: String(message).trim(),
      userId: userId || null,
    })
    return res.status(201).json({ enquiry })
  } catch (error) {
    return next(error)
  }
})

export default router
