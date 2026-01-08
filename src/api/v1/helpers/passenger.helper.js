import Passenger from "../models/passenger.model.js";
import Ride from "../models/ride.model.js";
import { returnFormatter } from "../formatters/common.formatter.js";
import {
  hashPassword,
  comparePassword,
  generateToken
} from "../utills/auth.util.js";
import {
  fullRegistrationRequiredMessage,
  userAlreadyExistsMessage,
  passengerCreatedMessage,
  emailPasswordRequiredMessage,
  userNotFoundMessage,
  invalidPasswordMessage,
  accountInactiveMessage,
  passengerLoginSuccessMessage,
  passengerProfileFetchedMessage,
  passengerRideHistoryFetchedMessage
} from "../constants/messageConstants.js";

// ---------------- register passenger ----------------
export async function registerPassenger(req) {
  try {
    const { email, phoneNumber, name, password } = req.body;

    // Validate required fields
    if (!email || !phoneNumber || !name || !password) {
      return returnFormatter(false, fullRegistrationRequiredMessage);
    }

    // Check if passenger already exists
    const existingPassenger = await Passenger.findOne({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingPassenger) {
      return returnFormatter(false, userAlreadyExistsMessage);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const passenger = await Passenger.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(passenger._id.toString(), "passenger");

    // Return passenger without password
    const passengerResponse = passenger.toObject();
    delete passengerResponse.password;

    return returnFormatter(true, passengerCreatedMessage, {
      ...passengerResponse,
      token
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ---------------- passenger login ----------------
export async function passengerLogin(req) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return returnFormatter(false, emailPasswordRequiredMessage);
    }

    const passenger = await Passenger.findOne({ email });

    if (!passenger) {
      return returnFormatter(false, userNotFoundMessage);
    }

    const isPasswordValid = await comparePassword(password, passenger.password);

    if (!isPasswordValid) {
      return returnFormatter(false, invalidPasswordMessage);
    }

    if (!passenger.isActive) {
      return returnFormatter(false, accountInactiveMessage);
    }

    // Update last login
    passenger.lastLoginAt = new Date();
    await passenger.save();

    // Generate token
    const token = generateToken(passenger._id.toString(), "passenger");

    // Return passenger without password
    const passengerResponse = passenger.toObject();
    delete passengerResponse.password;

    return returnFormatter(true, passengerLoginSuccessMessage, {
      ...passengerResponse,
      token
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ---------------- get passenger profile ----------------
export async function getPassengerProfile(passengerId) {
  try {
    const passenger = await Passenger.findById(passengerId).lean();

    if (!passenger) {
      return returnFormatter(false, userNotFoundMessage);
    }

    return returnFormatter(true, passengerProfileFetchedMessage, passenger);
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}

// ---------------- get passenger ride history ----------------
export async function getPassengerRideHistory(passengerId) {
  try {
    const passenger = await Passenger.findById(passengerId).lean();

    if (!passenger) {
      return returnFormatter(false, userNotFoundMessage);
    }

    const rides = await Ride.find({ passengerId })
      .populate("driverId", "name phoneNumber email rating vehicleType")
      .sort({ createdAt: -1 })
      .lean();

    return returnFormatter(true, passengerRideHistoryFetchedMessage, {
      passenger,
      rides,
      totalRides: rides.length,
      completedRides: rides.filter(r => r.status === "completed").length,
      cancelledRides: rides.filter(r => r.status === "cancelled").length
    });
  } catch (error) {
    return returnFormatter(false, error.message);
  }
}
