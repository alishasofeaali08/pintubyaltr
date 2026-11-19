import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// The API and Vite both read the same env files. Only VITE_* variables are
// exposed to the browser, so Mongo credentials and the JWT secret stay server-side.
const quiet = { quiet: true }
dotenv.config({ path: path.join(root, '.env.local'), ...quiet })
dotenv.config({ path: path.join(root, '.env'), ...quiet })
dotenv.config(quiet)

const parseOrigins = (value, fallback) =>
  (value || fallback).split(',').map((item) => item.trim()).filter(Boolean)

export const config = {
  root,
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pintu',
  jwtSecret: process.env.JWT_SECRET || 'pintu-development-secret-change-me',
  corsOrigins: parseOrigins(
    process.env.CORS_ORIGIN,
    'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173',
  ),
  isProduction: process.env.NODE_ENV === 'production',
}

if (config.isProduction && !process.env.JWT_SECRET) {
  console.warn('[pintu] WARNING: JWT_SECRET is not set. Set it before deploying.')
}
