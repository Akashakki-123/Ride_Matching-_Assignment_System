import Driver from "../models/driver.model.js";
import Ride from "../models/ride.model.js";
import { returnFormatter } from "../formatters/common.formatter.js";
import {
  driverCreatedMessage,
  driverUpdatedMessage,
  noDriverFoundMessage
} from "../constants/messageConstants.js";
import {
  setDriverLocationInRedis,
  setDriverStatusInRedis
} from "../utills/redis.util.js";

import {
  formatDriverRegisterData,
  formatDriverLocationUpdate,
  formatDriverStatusUpdate
} from "../formatters/driver.formatter.js";

// ---------------- register driver ----------------
export async function registerDriver(req) {
  try {
    const data = formatDriverRegisterData(req);
    const driver = await Driver.create(data);

    return returnFormatter(true, driverCreatedMessage, driver);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ---------------- update driver location ----------------
export async function updateDriverLocation(driverId, req) {
  try {
    const formattedData = formatDriverLocationUpdate(req);

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      formattedData,
      { new: true }
    );

    if (!driver) {
      return returnFormatter(false, noDriverFoundMessage);
    }

    await setDriverLocationInRedis(driverId, formattedData.location);

    return returnFormatter(true, driverUpdatedMessage, driver);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ---------------- update driver status ----------------
export async function updateDriverStatus(driverId, req) {
  try {
    const formattedData = formatDriverStatusUpdate(req);

    const driver = await Driver.findByIdAndUpdate(
      driverId,
      formattedData,
      { new: true }
    );

    if (!driver) {
      return returnFormatter(false, noDriverFoundMessage);
    }

    await setDriverStatusInRedis(driverId, formattedData.status);

    return returnFormatter(true, driverUpdatedMessage, driver);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ---------------- get driver ride history ----------------
export async function getDriverRideHistory(driverId) {
  try {
    const driver = await Driver.findById(driverId).lean();

    if (!driver) {
      return returnFormatter(false, noDriverFoundMessage);
    }

    const rides = await Ride.find({ driverId })
      .sort({ createdAt: -1 })
      .lean();

    return returnFormatter(true, "Ride history fetched", {
      driver,
      rides,
      totalRides: rides.length,
      completedRides: rides.filter(r => r.status === "completed").length,
      cancelledRides: rides.filter(r => r.status === "cancelled").length
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
