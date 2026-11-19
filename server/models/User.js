import mongoose from 'mongoose'

const { Schema, model } = mongoose

export const ROLES = ['Admin', 'Tenant', 'Landlord', 'Property Manager']
export const TIER_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum']

const userSchema = new Schema(
  {
    username: { type: String, required: true, trim: true, minlength: 3, maxlength: 50 },
    usernameKey: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '' },
    ic: { type: String, default: '' },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'Tenant' },
    tier: { type: String, enum: TIER_NAMES, default: 'Bronze' },
    wallet: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false },
)

userSchema.index({ usernameKey: 1 }, { unique: true })
userSchema.index({ email: 1 }, { unique: true })

userSchema.pre('validate', function syncUsernameKey() {
  if (this.username) this.usernameKey = this.username.trim().toLowerCase()
})

export const User = model('User', userSchema)

export function publicUser(user) {
  if (!user) return null
  return {
    id: String(user._id),
    name: user.username,
    username: user.username,
    email: user.email,
    phone: user.phone || '',
    role: user.role || 'Tenant',
    tier: user.tier || 'Bronze',
  }
}
