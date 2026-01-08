import { verifyToken } from "../utills/auth.util.js";
import { badRequest, unauthorized } from "../helpers/response.helper.js";
import {
  authorizationRequiredMessage,
  invalidOrExpiredTokenMessage,
  driverAuthorizationRequiredMessage,
  passengerAuthorizationRequiredMessage
} from "../constants/messageConstants.js";

// Middleware to verify JWT token
export function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return unauthorized(res, authorizationRequiredMessage);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = verifyToken(token);
    req.user = decoded;
    req.userId = decoded.userId;
    req.userType = decoded.userType;

    next();
  } catch (error) {
    return unauthorized(res, error.message || invalidOrExpiredTokenMessage);
  }
}

// Middleware to verify driver-specific requests
export function verifyDriverAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return unauthorized(res, authorizationRequiredMessage);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = verifyToken(token);

    if (decoded.userType !== "driver") {
      return unauthorized(res, driverAuthorizationRequiredMessage);
    }

    req.user = decoded;
    req.userId = decoded.userId;
    req.userType = decoded.userType;

    next();
  } catch (error) {
    return unauthorized(res, error.message || invalidOrExpiredTokenMessage);
  }
}

// Middleware to verify passenger-specific requests
export function verifyPassengerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return unauthorized(res, authorizationRequiredMessage);
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

    const decoded = verifyToken(token);

    if (decoded.userType !== "passenger") {
      return unauthorized(res, passengerAuthorizationRequiredMessage);
    }

    req.user = decoded;
    req.userId = decoded.userId;
    req.userType = decoded.userType;

    next();
  } catch (error) {
    return unauthorized(res, error.message || invalidOrExpiredTokenMessage);
  }
}
