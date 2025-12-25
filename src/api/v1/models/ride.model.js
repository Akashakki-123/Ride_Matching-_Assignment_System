import { Schema, model } from "mongoose";

const rideSchema = new Schema({

  passengerName: { type: String, required: true },

  passengerCount: { type: Number, required: true },

  pickupLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },

  dropoffLocation: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },

  driverId: { type: Schema.Types.ObjectId, ref: "driver", default: null },

  status: {
    type: String,
    enum: [
      "pending",
      "assigned",
      "accepted",
      "started",
      "completed",
      "cancelled",
      "failed"
    ],
    default: "pending"
  },

  estimatedFare: { type: Number, default: 0 },

  actualFare: { type: Number, default: null },

  assignmentAttempts: { type: Number, default: 0 },

  assignmentHistory: [{ type: Schema.Types.ObjectId, ref: "driver" }],

  startTime: { type: Date, default: null },

  endTime: { type: Date, default: null },

  cancelReason: { type: String, default: "" }

}, { timestamps: true });

rideSchema.index({ status: 1 });
rideSchema.index({ createdAt: -1 });
rideSchema.index({ driverId: 1 });

export default model("ride", rideSchema);
