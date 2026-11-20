import mongoose from 'mongoose'

const { Schema, model } = mongoose
const rentalPaymentSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  tenantName: { type: String, required: true, trim: true },
  managerId: { type: String, required: true, index: true },
  managerName: { type: String, required: true },
  property: { type: String, required: true, trim: true },
  unit: { type: String, default: '', trim: true },
  month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
  amount: { type: Number, required: true, min: 0.01 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
}, { timestamps: true, versionKey: false })

rentalPaymentSchema.index({ tenantId: 1, property: 1, unit: 1, month: 1 }, { unique: true })
export const RentalPayment = model('RentalPayment', rentalPaymentSchema)
