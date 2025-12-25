import { Router } from "express";
import {
  registerDriverInfo,
  updateDriverLocationInfo,
  updateDriverStatusInfo,
  getDriverRideHistory
} from "../controllers/driver.controller.js";

const driverRouter = Router();

// ---------------- driver management ----------------
driverRouter.post("/register", registerDriverInfo);

driverRouter.patch("/:id/location", updateDriverLocationInfo);

driverRouter.patch("/:id/status", updateDriverStatusInfo);

// ---------------- driver ride history ----------------
driverRouter.get("/:id/ride-history", getDriverRideHistory);

export default driverRouter;
