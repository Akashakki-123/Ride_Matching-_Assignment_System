import {
  acquireLock,
  releaseLock,
  driverLockKey
} from "../utils/redis.util.js";

export async function driverLock(req, res, next) {
  const driverId = req.body.driverId || req.params.id;

  if (!driverId) {
    return res.status(400).json({ message: "DriverId required" });
  }

  const lockKey = driverLockKey(driverId);
  const locked = await acquireLock(lockKey);

  if (!locked) {
    return res.status(409).json({
      message: "Driver is busy, try again"
    });
  }

  req.lockKey = lockKey;

  res.on("finish", async () => {
    await releaseLock(lockKey);
  });

  next();
}
