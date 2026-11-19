import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { Post } from '../models/Post.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const serializePost = (post) => ({ ...post.toObject({ virtuals: true }), id: String(post._id) })

// Media arrives as data URLs from the browser. Keep an upper bound so a single
// post cannot exceed MongoDB's document limit.
function normalizeMedia(input) {
  if (!Array.isArray(input)) return []
  if (input.length > 4) throw new Error('You can add up to 4 images, or 1 video.')
  if (input.filter((item) => item?.type === 'video').length > 1) {
    throw new Error('You can add only one video per post.')
  }
  if (input.some((item) => item?.type === 'video') && input.length > 1) {
    throw new Error('A video cannot be mixed with images in the same post.')
  }
  return input.map((item) => {
    const type = item?.type
    const url = item?.url
    const prefix = `data:${type}/`
    const max = type === 'video' ? 12_000_000 : 4_000_000
    if (!['image', 'video'].includes(type) || typeof url !== 'string' || !url.startsWith(prefix) || url.length > max) {
      throw new Error('That image or video is too large or in an unsupported format.')
    }
    return { type, url }
  })
}

router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ date: -1 }).lean()
    return res.json({ posts: posts.map((item) => ({ ...item, id: String(item._id) })) })
  } catch (error) {
    return next(error)
  }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const title = String(req.body?.title || '').trim()
    const content = String(req.body?.content || '').trim()
    const category = String(req.body?.category || 'General Discussion').trim() || 'General Discussion'

    let media
    try {
      media = normalizeMedia(req.body?.media)
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
    if (!content && media.length === 0) {
      return res.status(400).json({ error: 'Add a caption, a photo or a video to your post.' })
    }
    if (content.length > 500) {
      return res.status(400).json({ error: 'Your post cannot exceed 500 characters.' })
    }

    const post = await Post.create({
      userId: String(req.user._id),
      author: req.user.username,
      role: req.user.role,
      title,
      content,
      category,
      media,
      likes: [],
      comments: [],
    })
    return res.status(201).json({ post: serializePost(post) })
  } catch (error) {
    return next(error)
  }
})

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found.' })
    if (String(post.userId) !== String(req.user._id) && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'You can only delete your own posts.' })
    }
    await post.deleteOne()
    return res.json({ ok: true })
  } catch (error) {
    return next(error)
  }
})

router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found.' })

    const id = String(req.user._id)
    post.likes = post.likes.includes(id) ? post.likes.filter((item) => item !== id) : [...post.likes, id]
    await post.save()
    return res.json({ post: serializePost(post) })
  } catch (error) {
    return next(error)
  }
})

router.post('/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ error: 'Post not found.' })

    const text = String(req.body?.text || '').trim()
    if (!text) return res.status(400).json({ error: 'Please write a comment.' })
    if (text.length > 250) return res.status(400).json({ error: 'Comments cannot exceed 250 characters.' })

    post.comments.push({
      id: randomUUID(),
      userId: String(req.user._id),
      author: req.user.username,
      text,
      date: new Date(),
    })
    await post.save()
    return res.json({ post: serializePost(post) })
  } catch (error) {
    return next(error)
  }
})

export default router
