import Ride from "../models/ride.model.js";
import Driver from "../models/driver.model.js";
import redis from "../config/redis.js";

const AUTO_CANCEL_TIME = 5 * 60 * 1000; // 5 minutes

export async function autoCancelPendingRides() {
  try {
    const cutoffTime = new Date(Date.now() - AUTO_CANCEL_TIME);

    const expiredRides = await Ride.find({
      status: { $in: ["pending", "assigned"] },
      createdAt: { $lte: cutoffTime }
    });

    for (const ride of expiredRides) {
      // free driver if assigned
      if (ride.driverId) {
        await Driver.findByIdAndUpdate(
          ride.driverId,
          { status: "available" }
        );

        await redis.del(`driver:lock:${ride.driverId}`);
      }

      ride.status = "cancelled";
      ride.cancelReason = "No driver accepted within 5 minutes";
      await ride.save();
    }

    if (expiredRides.length) {
      console.log(`⏱ Auto-cancelled ${expiredRides.length} rides`);
    }
  } catch (error) {
    console.error("Auto-cancel job error:", error.message);
  }
}
