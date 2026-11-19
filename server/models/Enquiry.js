import mongoose from 'mongoose'

const { Schema, model } = mongoose

const enquirySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, default: '' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    userId: { type: String, default: null },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false },
)

export const Enquiry = model('Enquiry', enquirySchema)
