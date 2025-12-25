import redis from "../config/redis.js";

/* ---------------- driver keys ---------------- */
const DRIVER_LOCATION_KEY = (id) => `driver:location:${id}`;
const DRIVER_STATUS_KEY = (id) => `driver:status:${id}`;
const DRIVER_LOCK_KEY = (id) => `driver:lock:${id}`;

/* ---------------- set driver location ---------------- */
export async function setDriverLocationInRedis(driverId, location) {
  await redis.set(
    DRIVER_LOCATION_KEY(driverId),
    JSON.stringify(location),
    "EX",
    60 // TTL 60 sec (real-time)
  );
}

/* ---------------- set driver status ---------------- */
export async function setDriverStatusInRedis(driverId, status) {
  await redis.set(
    DRIVER_STATUS_KEY(driverId),
    status,
    "EX",
    120
  );
}

/* ---------------- check availability ---------------- */
export async function isDriverAvailable(driverId) {
  const status = await redis.get(DRIVER_STATUS_KEY(driverId));
  return status === "available";
}

/* ---------------- distributed lock with TTL - 10 seconds max to prevent deadlock ---------------- */
export async function acquireLock(key, ttl = 10000) {
  const result = await redis.set(
    key,
    "locked",
    "PX",
    ttl,
    "NX"
  );
  return result === "OK";
}

export async function releaseLock(key) {
  await redis.del(key);
}

export function driverLockKey(driverId) {
  return DRIVER_LOCK_KEY(driverId);
}
