import { Schema, model } from "mongoose";

const passengerSchema = new Schema({
  name: { type: String, required: true },

  phoneNumber: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  rating: { type: Number, default: 4.5, min: 0, max: 5 },

  totalRides: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },

  lastLoginAt: { type: Date, default: null }

}, { timestamps: true });

passengerSchema.index({ email: 1 });
passengerSchema.index({ phoneNumber: 1 });
passengerSchema.index({ createdAt: -1 });

export default model("passenger", passengerSchema);
