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

const rideRouter = Router();

// ---------------- ride requests ----------------
rideRouter.post("/request", createRideRequest);

rideRouter.get("/active", getActiveRides);

rideRouter.get("/:id", getRideDetails);

// ---------------- driver actions ----------------
rideRouter.patch("/:id/accept", acceptRideInfo);

rideRouter.patch("/:id/reject", rejectRideInfo);

rideRouter.patch("/:id/start", startRideInfo);

rideRouter.patch("/:id/complete", completeRideInfo);

// ---------------- cancel ----------------
rideRouter.patch("/:id/cancel", cancelRideInfo);

export default rideRouter;
