import { Router } from "express";
import {
  registerDriverInfo,
  driverLoginInfo,
  updateDriverLocationInfo,
  updateDriverStatusInfo,
  getDriverRideHistory
} from "../controllers/driver.controller.js";
import { verifyDriverAuth } from "../middlewares/auth.middleware.js";

const driverRouter = Router();

// ---------------- driver authentication ----------------
driverRouter.post("/register", registerDriverInfo);

driverRouter.post("/login", driverLoginInfo);

// ---------------- driver management (protected) ----------------
driverRouter.patch("/:id/location", verifyDriverAuth, updateDriverLocationInfo);

driverRouter.patch("/:id/status", verifyDriverAuth, updateDriverStatusInfo);

// ---------------- driver ride history (protected) ----------------
driverRouter.get("/:id/ride-history", verifyDriverAuth, getDriverRideHistory);

export default driverRouter;
