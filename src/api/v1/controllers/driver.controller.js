import {
  registerDriver,
  updateDriverLocation,
  updateDriverStatus,
  getDriverRideHistory as getHistoryFromHelper
} from "../helpers/driver.helper.js";

import {
  success,
  created,
  badRequest,
  unknownError,
  notFound
} from "../helpers/response.helper.js";

import { noDriverFoundMessage } from "../constants/messageConstants.js";

// ---------------- register driver ----------------
export async function registerDriverInfo(req, res) {
  try {
    const { status, message, data } = await registerDriver(req);
    return status
      ? created(res, message, data)
      : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- update driver location ----------------
export async function updateDriverLocationInfo(req, res) {
  try {
    const { status, message, data } = await updateDriverLocation(
      req.params.id,
      req
    );

    return status
      ? success(res, message, data)
      : notFound(res, message || noDriverFoundMessage);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- update driver status ----------------
export async function updateDriverStatusInfo(req, res) {
  try {
    const { status, message, data } = await updateDriverStatus(
      req.params.id,
      req
    );

    return status
      ? success(res, message, data)
      : notFound(res, message || noDriverFoundMessage);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- get driver ride history ----------------
export async function getDriverRideHistory(req, res) {
  try {
    const { status, message, data } = await getHistoryFromHelper(
      req.params.id
    );

    return status
      ? success(res, message, data)
      : notFound(res, message || noDriverFoundMessage);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
