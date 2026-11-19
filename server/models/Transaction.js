import mongoose from 'mongoose'

const { Schema, model } = mongoose

const transactionSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, default: '' },
    type: { type: String, enum: ['top-up', 'upgrade'], required: true },
    tier: { type: String, default: null },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false },
)

export const Transaction = model('Transaction', transactionSchema)
