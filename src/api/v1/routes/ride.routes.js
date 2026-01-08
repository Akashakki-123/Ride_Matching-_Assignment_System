import { Router } from "express";
import {
  createRideRequest,
  getRideDetails,
  acceptRideInfo,
  startRideInfo,
  completeRideInfo,
  cancelRideInfo,
  getActiveRides,
  rejectRideInfo
} from "../controllers/ride.controller.js";
import { verifyPassengerAuth, verifyDriverAuth, verifyAuth } from "../middlewares/auth.middleware.js";

const rideRouter = Router();

// ---------------- ride requests (passenger auth required) ----------------
rideRouter.post("/request", verifyPassengerAuth, createRideRequest);

rideRouter.get("/active", verifyAuth, getActiveRides);

rideRouter.get("/:id", verifyAuth, getRideDetails);

// ---------------- driver actions (driver auth required) ----------------
rideRouter.patch("/:id/accept", verifyDriverAuth, acceptRideInfo);

rideRouter.patch("/:id/reject", verifyDriverAuth, rejectRideInfo);

rideRouter.patch("/:id/start", verifyDriverAuth, startRideInfo);

rideRouter.patch("/:id/complete", verifyDriverAuth, completeRideInfo);

// ---------------- cancel (auth required) ----------------
rideRouter.patch("/:id/cancel", verifyAuth, cancelRideInfo);

export default rideRouter;
