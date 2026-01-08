import Driver from "../models/driver.model.js";
import Ride from "../models/ride.model.js";
import { returnFormatter } from "../formatters/common.formatter.js";
import {
  driverCreatedMessage,
  driverUpdatedMessage,
  noDriverFoundMessage,
  userAlreadyExistsMessage,
  emailPasswordRequiredMessage,
  userNotFoundMessage,
  invalidPasswordMessage,
  accountInactiveMessage,
  driverLoginSuccessMessage,
  driverRideHistoryFetchedMessage
} from "../constants/messageConstants.js";
import {
  setDriverLocationInRedis,
  setDriverStatusInRedis
} from "../utills/redis.util.js";
import {
  hashPassword,
  comparePassword,
  generateToken
} from "../utills/auth.util.js";

import {
  formatDriverRegisterData,
  formatDriverLocationUpdate,
  formatDriverStatusUpdate
} from "../formatters/driver.formatter.js";

// ---------------- register driver ----------------
export async function registerDriver(req) {
  try {
    const { email, phoneNumber } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingDriver) {
      return returnFormatter(false, userAlreadyExistsMessage);
    }

    const data = formatDriverRegisterData(req);
    
    // Hash password
    data.password = await hashPassword(data.password);

    const driver = await Driver.create(data);

    // Generate token
    const token = generateToken(driver._id.toString(), "driver");

    // Return driver without password
    const driverResponse = driver.toObject();
    delete driverResponse.password;

    return returnFormatter(true, driverCreatedMessage, {
      ...driverResponse,
      token
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ---------------- driver login ----------------
export async function driverLogin(req) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return returnFormatter(false, emailPasswordRequiredMessage);
    }

    const driver = await Driver.findOne({ email });

    if (!driver) {
      return returnFormatter(false, userNotFoundMessage);
    }

    const isPasswordValid = await comparePassword(password, driver.password);

    if (!isPasswordValid) {
      return returnFormatter(false, invalidPasswordMessage);
    }

    if (!driver.isActive) {
      return returnFormatter(false, accountInactiveMessage);
    }

    // Update last login
    driver.lastLoginAt = new Date();
    await driver.save();

    // Generate token
    const token = generateToken(driver._id.toString(), "driver");

    // Return driver without password
    const driverResponse = driver.toObject();
    delete driverResponse.password;

    return returnFormatter(true, driverLoginSuccessMessage, {
      ...driverResponse,
      token
    });
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

    return returnFormatter(true, driverRideHistoryFetchedMessage, {
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
