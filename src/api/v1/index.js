import { Router } from 'express';

import driverRoutes from "./routes/driver.routes.js";
import rideRoutes from "./routes/ride.routes.js";



const router = Router();




router.use("/api/drivers", driverRoutes);
router.use("/api/rider", rideRoutes);


export default router;
