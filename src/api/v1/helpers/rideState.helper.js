import Ride from "../models/ride.model.js";
import Driver from "../models/driver.model.js";
import { returnFormatter } from "../formatters/common.formatter.js";
import { assignRideToDriver } from "./rideMatching.helper.js";

export async function acceptRide(rideId, driverId) {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      driverId,
      status: "assigned"
    });

    if (!ride) {
      return returnFormatter(false, "Invalid ride state");
    }

    ride.status = "accepted";
    await ride.save();

    return returnFormatter(true, "Ride accepted", ride);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function startRide(rideId, driverId) {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      driverId,
      status: "accepted"
    });

    if (!ride) {
      return returnFormatter(false, "Ride cannot be started");
    }

    ride.status = "started";
    ride.startTime = new Date();
    await ride.save();

    return returnFormatter(true, "Ride started", ride);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function completeRide(rideId, driverId) {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      driverId,
      status: "started"
    });

    if (!ride) {
      return returnFormatter(false, "Ride cannot be completed");
    }

    ride.status = "completed";
    ride.endTime = new Date();
    await ride.save();

    await Driver.findByIdAndUpdate(driverId, { status: "available" });

    return returnFormatter(true, "Ride completed", ride);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

export async function rejectRide(rideId, driverId) {
  try {
    const ride = await Ride.findOne({
      _id: rideId,
      driverId,
      status: "assigned"
    });

    if (!ride) {
      return returnFormatter(false, "Ride cannot be rejected - Invalid state");
    }

    // Release driver from this ride
    ride.driverId = null;
    ride.status = "pending";
    await ride.save();

    // Free up driver
    await Driver.findByIdAndUpdate(driverId, { status: "available" });

    // Try reassigning to another driver
    const reassignResult = await assignRideToDriver(rideId);

    return returnFormatter(
      true, 
      "Ride rejected and reassigned", 
      { ride, reassignmentStatus: reassignResult }
    );
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
