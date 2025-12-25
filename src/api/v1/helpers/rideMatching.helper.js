import Ride from "../models/ride.model.js";
import Driver from "../models/driver.model.js";
import { returnFormatter } from "../formatters/common.formatter.js";
import {
  noDriverAvailableMessage,
  rideAssignedMessage
} from "../constants/messageConstants.js";

import {
  acquireLock,
  releaseLock,
  isDriverAvailable
} from "../utills/redis.util.js";

// ---------------- find nearest available driver ----------------
async function findNearestDriver(pickupLocation, excludedDrivers = []) {
  return Driver.findOne({
    _id: { $nin: excludedDrivers },
    status: "available",
    location: {
      $near: {
        $geometry: pickupLocation,
        $maxDistance: 5000 // 5km
      }
    }
  });
}

// ---------------- assign ride to driver ----------------
export async function assignRideToDriver(rideId) {
  try {
    const ride = await Ride.findById(rideId);
    if (!ride) return returnFormatter(false, "Ride not found");

    if (ride.assignmentAttempts >= 3) {
      ride.status = "failed";
      await ride.save();
      return returnFormatter(false, noDriverAvailableMessage);
    }

    const driver = await findNearestDriver(
      ride.pickupLocation,
      ride.assignmentHistory
    );

    if (!driver) {
      return returnFormatter(false, noDriverAvailableMessage);
    }

    const lockKey = `driver_lock_${driver._id}`;
    const lock = await acquireLock(lockKey);

    if (!lock) {
      return assignRideToDriver(rideId); // retry with next driver
    }

    const available = await isDriverAvailable(driver._id);
    if (!available) {
      await releaseLock(lockKey);
      return assignRideToDriver(rideId);
    }

    // assign
    ride.driverId = driver._id;
    ride.status = "assigned";
    ride.assignmentAttempts += 1;
    ride.assignmentHistory.push(driver._id);
    await ride.save();

    await Driver.findByIdAndUpdate(driver._id, { status: "on_trip" });

    await releaseLock(lockKey);

    return returnFormatter(true, rideAssignedMessage, ride);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
