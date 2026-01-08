import { Schema, model } from "mongoose";

const driverSchema = new Schema({
  name: { type: String, required: true },
  
  phoneNumber: { type: String, required: true, unique: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },
  
  vehicleType: { type: String, required: true },

  capacity: { type: Number, required: true },

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },

  status: {
    type: String,
    enum: ["available", "on_trip", "offline"],
    default: "offline"
  },

  rating: { type: Number, default: 4.5, min: 0, max: 5 },

  totalRides: { type: Number, default: 0 },

  acceptanceRate: { type: Number, default: 100, min: 0, max: 100 },

  isActive: { type: Boolean, default: true },

  lastLocationUpdatedAt: { type: Date, default: Date.now },

  lastLoginAt: { type: Date, default: null }

}, { timestamps: true });




driverSchema.index({ location: "2dsphere" });
driverSchema.index({ status: 1 });
driverSchema.index({ updatedAt: -1 });



export default model("driver", driverSchema);
