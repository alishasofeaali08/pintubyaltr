import mongoose from 'mongoose'
const { Schema, model } = mongoose
const storySchema = new Schema({
  userId: { type: String, required: true, index: true },
  author: { type: String, default: '' },
  role: { type: String, default: 'Tenant' },
  content: { type: String, default: '', maxlength: 500 },
  media: { type: [{ type: { type: String, enum: ['image', 'video'] }, url: String }], default: [] },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
}, { timestamps: true, versionKey: false })
export const Story = model('Story', storySchema)
