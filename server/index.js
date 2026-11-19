import mongoose from 'mongoose'
import { createApp } from './app.js'
import { config } from './config.js'

async function start() {
  try {
    await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 })
    console.log(`[pintu] MongoDB connected (${mongoose.connection.name}).`)

    const server = createApp().listen(config.port, () => {
      console.log(`[pintu] API listening on http://localhost:${config.port}`)
    })

    const shutdown = async () => {
      server.close(async () => {
        await mongoose.disconnect()
        process.exit(0)
      })
    }
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  } catch (error) {
    console.error('[pintu] Could not start:', error.message)
    console.error('[pintu] Check MONGODB_URI and that MongoDB is reachable.')
    process.exit(1)
  }
}

start()
