import fs from 'node:fs'
import path from 'node:path'
import cors from 'cors'
import express from 'express'
import mongoose from 'mongoose'
import { config } from './config.js'
import { apiNotFound, errorHandler } from './middleware/error.js'
import authRoutes from './routes/auth.js'
import enquiryRoutes from './routes/enquiries.js'
import listingRoutes from './routes/listings.js'
import messageRoutes from './routes/messages.js'
import postRoutes from './routes/posts.js'
import ratingRoutes from './routes/ratings.js'
import userRoutes from './routes/users.js'
import walletRoutes from './routes/wallet.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')

  app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  // Property images and social feed media are sent as data URLs by the client.
  app.use(express.json({ limit: '20mb' }))

  app.get('/api/health', (req, res) => {
    return res.json({
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/listings', listingRoutes)
  app.use('/api/posts', postRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/ratings', ratingRoutes)
  app.use('/api/wallet', walletRoutes)
  app.use('/api/enquiries', enquiryRoutes)
  app.use('/api', apiNotFound)

  // In production one process serves both the API and the built React app.
  const distDir = path.join(config.root, 'dist')
  if (fs.existsSync(path.join(distDir, 'index.html'))) {
    app.use(express.static(distDir))
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
      return res.sendFile(path.join(distDir, 'index.html'))
    })
  }

  app.use(errorHandler)
  return app
}
