import { Router } from 'express'
import { Message } from '../models/Message.js'
import { User } from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// One entry per conversation, with the most recent message first.
router.get('/threads', async (req, res, next) => {
  try {
    const me = String(req.user._id)
    const messages = await Message.find({
      $or: [{ senderId: me }, { receiverId: me }],
    }).sort({ date: -1 }).limit(500).lean()

    const seen = new Set()
    const threads = []
    for (const message of messages) {
      if (seen.has(message.threadId)) continue
      seen.add(message.threadId)
      const outgoing = String(message.senderId) === me
      threads.push({
        id: message.threadId,
        threadId: message.threadId,
        participantId: outgoing ? String(message.receiverId) : String(message.senderId),
        participantName: outgoing
          ? (message.receiverName || 'PINTU member')
          : (message.senderName || 'PINTU member'),
        lastMessage: message.text,
        lastDate: message.date,
        contextId: message.contextId || message.propertyId || null,
        contextTitle: message.contextTitle || '',
      })
    }
    return res.json({ threads })
  } catch (error) {
    return next(error)
  }
})

router.get('/', async (req, res, next) => {
  try {
    const threadId = String(req.query.threadId || '')
    if (!threadId) return res.status(400).json({ error: 'A conversation id is required.' })

    const messages = await Message.find({
      threadId,
      $or: [{ senderId: String(req.user._id) }, { receiverId: String(req.user._id) }],
    }).sort({ date: 1 }).lean()
    return res.json({ messages })
  } catch (error) {
    return next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const threadId = String(req.body?.threadId || '')
    const receiverId = String(req.body?.receiverId || '')
    const text = String(req.body?.text || '').trim()
    if (!threadId || !receiverId || !text) {
      return res.status(400).json({ error: 'Please write a message.' })
    }
    if (text.length > 1000) return res.status(400).json({ error: 'Messages cannot exceed 1000 characters.' })
    if (receiverId === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot message yourself.' })
    }
    if (!(await User.exists({ _id: receiverId }))) {
      return res.status(404).json({ error: 'The recipient no longer has an account.' })
    }

    const message = await Message.create({
      threadId,
      propertyId: req.body.propertyId || null,
      contextId: req.body.contextId || null,
      contextTitle: String(req.body.contextTitle || '').slice(0, 200),
      senderId: String(req.user._id),
      senderName: req.user.username,
      receiverId,
      receiverName: String(req.body.receiverName || ''),
      text,
    })
    return res.status(201).json({ message: { ...message.toObject({ virtuals: true }), id: String(message._id) } })
  } catch (error) {
    return next(error)
  }
})

export default router
