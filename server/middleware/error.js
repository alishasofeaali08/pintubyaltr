export function apiNotFound(req, res) {
  return res.status(404).json({ error: `Unknown API endpoint: ${req.method} ${req.path}` })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(error.errors)[0]?.message || 'Invalid data.' })
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid identifier.' })
  }
  if (error.code === 11000) {
    return res.status(409).json({ error: 'A record with these details already exists.' })
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'The image is too large. Maximum size is 1 MB.' })
  }

  console.error('[pintu]', error)
  return res.status(500).json({ error: 'Something went wrong on the server.' })
}
