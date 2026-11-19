import mongoose from 'mongoose'

const { Schema, model } = mongoose

const ratingSchema = new Schema(
  {
    userId: { type: String, required: true },
    raterId: { type: String, required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false },
)

ratingSchema.index({ userId: 1, raterId: 1 }, { unique: true })

export const Rating = model('Rating', ratingSchema)

export async function ratingSummary(userId) {
  const votes = await Rating.find({ userId: String(userId) }).select('value').lean()
  const count = votes.length
  const average = count
    ? Math.round((votes.reduce((sum, vote) => sum + vote.value, 0) / count) * 10) / 10
    : 0
  return { count, average }
}
