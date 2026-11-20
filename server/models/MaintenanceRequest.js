import mongoose from 'mongoose'
const { Schema, model } = mongoose
const maintenanceRequestSchema = new Schema({
  tenantId: { type: String, required: true, index: true },
  tenantName: { type: String, default: '' },
  property: { type: String, required: true, trim: true },
  unit: { type: String, default: '', trim: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
  description: { type: String, required: true, trim: true, maxlength: 1500 },
  status: { type: String, enum: ['Submitted', 'In Progress', 'Completed', 'Rejected'], default: 'Submitted' },
  managerNote: { type: String, default: '' },
}, { timestamps: true, versionKey: false })
export const MaintenanceRequest = model('MaintenanceRequest', maintenanceRequestSchema)
