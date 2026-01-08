import { Router } from "express";
import {
  registerPassengerInfo,
  passengerLoginInfo,
  getPassengerProfile,
  getPassengerRideHistory
} from "../controllers/passenger.controller.js";
import { verifyPassengerAuth } from "../middlewares/auth.middleware.js";

const passengerRouter = Router();

// ---------------- passenger authentication ----------------
passengerRouter.post("/register", registerPassengerInfo);

passengerRouter.post("/login", passengerLoginInfo);

// ---------------- passenger profile (protected) ----------------
passengerRouter.get("/:id/profile", verifyPassengerAuth, getPassengerProfile);

passengerRouter.get("/profile", verifyPassengerAuth, getPassengerProfile);

// ---------------- passenger ride history (protected) ----------------
passengerRouter.get("/:id/ride-history", verifyPassengerAuth, getPassengerRideHistory);

passengerRouter.get("/ride-history", verifyPassengerAuth, getPassengerRideHistory);

export default passengerRouter;
