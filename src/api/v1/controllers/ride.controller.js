import Ride from "../models/ride.model.js";

import {
  assignRideToDriver
} from "../helpers/rideMatching.helper.js";

import {
  acceptRide,
  startRide,
  completeRide,
  rejectRide
} from "../helpers/rideState.helper.js";

import {
  success,
  created,
  badRequest,
  unknownError,
  notFound
} from "../helpers/response.helper.js";

import {
  noRideFoundMessage
} from "../constants/messageConstants.js";

import {
  formatRideRequestData,
  formatRideCancelData
} from "../formatters/ride.formatter.js";

// ---------------- create ride request ----------------
export async function createRideRequest(req, res) {
  try {
    const rideData = formatRideRequestData(req);
    const ride = await Ride.create(rideData);

    // async assignment
    assignRideToDriver(ride._id);

    return created(res, "Ride request created", ride);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- get ride details ----------------
export async function getRideDetails(req, res) {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("driverId")
      .lean();

    if (!ride) {
      return notFound(res, noRideFoundMessage);
    }

    return success(res, "Ride details fetched", ride);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- driver accepts ride ----------------
export async function acceptRideInfo(req, res) {
  try {
    const { status, message, data } = await acceptRide(
      req.params.id,
      req.body.driverId
    );

    return status
      ? success(res, message, data)
      : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- driver rejects ride ----------------
export async function rejectRideInfo(req, res) {
  try {
    const { status, message, data } = await rejectRide(
      req.params.id,
      req.body.driverId
    );

    return status
      ? success(res, message, data)
      : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- start ride ----------------
export async function startRideInfo(req, res) {
  try {
    const { status, message, data } = await startRide(
      req.params.id,
      req.body.driverId
    );

    return status
      ? success(res, message, data)
      : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- complete ride ----------------
export async function completeRideInfo(req, res) {
  try {
    const { status, message, data } = await completeRide(
      req.params.id,
      req.body.driverId
    );

    return status
      ? success(res, message, data)
      : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- cancel ride ----------------
export async function cancelRideInfo(req, res) {
  try {
    const updateData = formatRideCancelData(req);

    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled", ...updateData },
      { new: true }
    );

    if (!ride) {
      return notFound(res, noRideFoundMessage);
    }

    return success(res, "Ride cancelled", ride);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- get active rides ----------------
export async function getActiveRides(req, res) {
  try {
    const rides = await Ride.find({
      status: { $in: ["pending", "assigned", "accepted", "started"] }
    })
      .populate("driverId", "name phoneNumber vehicleType")
      .sort({ createdAt: -1 })
      .lean();

    return success(res, "Active rides fetched", {
      count: rides.length,
      rides
    });
  } catch (error) {
    return unknownError(res, error.message);
  }
}
