import mongoose from 'mongoose'
const { Schema, model } = mongoose
const announcementSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, required: true, trim: true, maxlength: 3000 },
  audience: { type: String, enum: ['Everyone', 'Tenants', 'Landlords', 'Property Managers'], default: 'Everyone' },
  authorId: { type: String, required: true },
  authorName: { type: String, default: 'Admin' },
  published: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false })
export const Announcement = model('Announcement', announcementSchema)
