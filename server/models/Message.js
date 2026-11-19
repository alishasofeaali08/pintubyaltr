import mongoose from 'mongoose'

const { Schema, model } = mongoose

const messageSchema = new Schema(
  {
    threadId: { type: String, required: true, index: true },
    propertyId: { type: String, default: null },
    contextId: { type: String, default: null },
    contextTitle: { type: String, default: '' },
    senderId: { type: String, required: true },
    senderName: { type: String, default: '' },
    receiverId: { type: String, required: true },
    receiverName: { type: String, default: '' },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { versionKey: false },
)

export const Message = model('Message', messageSchema)
