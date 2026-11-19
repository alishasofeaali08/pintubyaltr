import mongoose from 'mongoose'

const { Schema, model } = mongoose

const commentSchema = new Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    author: { type: String, default: '' },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: false, versionKey: false },
)

const mediaSchema = new Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
  },
  { _id: false, versionKey: false },
)

const postSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    author: { type: String, default: '' },
    role: { type: String, default: 'Tenant' },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    category: { type: String, default: 'General Discussion' },
    media: { type: [mediaSchema], default: [] },
    likes: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false },
)

export const Post = model('Post', postSchema)
