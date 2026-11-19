import mongoose from 'mongoose'

const { Schema, model } = mongoose

const listingSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    ownerName: { type: String, default: '' },
    ownerRole: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    location: { type: String, required: true, trim: true },
    bedrooms: { type: Number, default: 0 },
    bathrooms: { type: Number, default: 0 },
    furnishing: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    status: { type: String, default: 'Available' },
  },
  { timestamps: true, versionKey: false },
)

export const Listing = model('Listing', listingSchema)
