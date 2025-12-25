import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://default:lhKlwvEc9KVm22FXJRGnvmWHpUVxKiPu@redis-19728.crce217.ap-south-1-1.ec2.cloud.redislabs.com:19728");

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

export default redis;
