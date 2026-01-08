import {
  registerPassenger,
  passengerLogin,
  getPassengerProfile as getProfileFromHelper,
  getPassengerRideHistory as getHistoryFromHelper
} from "../helpers/passenger.helper.js";

import {
  success,
  created,
  badRequest,
  unknownError,
  notFound
} from "../helpers/response.helper.js";

import { noDriverFoundMessage } from "../constants/messageConstants.js";

// ---------------- register passenger ----------------
export async function registerPassengerInfo(req, res) {
  try {
    const { status, message, data } = await registerPassenger(req);
    return status
      ? created(res, message, data)
      : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- passenger login ----------------
export async function passengerLoginInfo(req, res) {
  try {
    const { status, message, data } = await passengerLogin(req);
    return status
      ? success(res, message, data)
      : badRequest(res, message);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- get passenger profile ----------------
export async function getPassengerProfile(req, res) {
  try {
    const { status, message, data } = await getProfileFromHelper(
      req.params.id || req.userId
    );

    return status
      ? success(res, message, data)
      : notFound(res, message || noDriverFoundMessage);
  } catch (error) {
    return unknownError(res, error.message);
  }
}

// ---------------- get passenger ride history ----------------
export async function getPassengerRideHistory(req, res) {
  try {
    const { status, message, data } = await getHistoryFromHelper(
      req.params.id || req.userId
    );

    return status
      ? success(res, message, data)
      : notFound(res, message || noDriverFoundMessage);
  } catch (error) {
    return unknownError(res, error.message);
  }
}
