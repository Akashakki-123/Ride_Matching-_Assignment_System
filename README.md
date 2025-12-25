# Ride Matching & Assignment System

A sophisticated ride-matching system built with Node.js, Express, MongoDB, and Redis. This system efficiently matches passengers with nearby available drivers while handling real-time state management, race conditions, and distributed system challenges.

## 🎯 Overview

This is a mid-level backend engineering project that implements:
- **Geospatial Queries**: Find nearest drivers within a 5km radius using PostGIS-like MongoDB queries
- **State Machine Management**: Proper ride lifecycle (pending → assigned → accepted → started → completed)
- **Distributed Concurrency Control**: Redis-based locks prevent double-booking of drivers
- **Real-time Driver Tracking**: Location and status updates stored in Redis with TTL
- **Automatic Reassignment Logic**: Failed assignments automatically try next nearest driver (max 3 attempts)
- **Auto-cancellation Job**: Rides pending for 5+ minutes auto-cancel with proper cleanup

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Framework** | Express.js | 5.1.0 |
| **Database** | MongoDB | Atlas (Cloud) |
| **Cache/Locks** | Redis | ioredis 5.8.2 |
| **ODM** | Mongoose | 8.18.1 |
| **Language** | JavaScript (ES6+) | ES Modules |

---

## 📋 Core Features

### 1. Driver Management
- **Register Driver**: Create driver profile with vehicle details and location
- **Update Location**: Real-time location updates (10-30 second intervals)
- **Update Availability**: Toggle driver status (available, on_trip, offline)
- **Ride History**: Get completed/cancelled rides with statistics

### 2. Ride Requests
- **Create Ride**: Submit pickup/dropoff locations with passenger count
- **Automatic Matching**: System finds nearest available driver within 5km
- **Get Details**: Fetch full ride info with assigned driver details
- **Active Rides**: List all ongoing rides

### 3. Active Ride Management
- **Accept/Reject**: Driver can accept or reject assigned ride
- **Start Trip**: Driver confirms passenger pickup
- **Complete Trip**: Driver confirms passenger dropoff
- **Cancel Ride**: Passenger or driver can cancel with reason
- **Track Status**: Monitor ride state in real-time

### 4. Real-time State Management
- Proper state transitions with guards (prevent invalid state changes)
- Distributed state stored in Redis for instant availability checks
- Automatic cleanup on ride completion or cancellation

---

## 📦 API Endpoints

### Driver Routes `/v1/api/drivers`

```
POST   /register
  Description: Register a new driver
  Body: { name, phoneNumber, email, vehicleType, capacity, latitude, longitude }
  Response: { _id, name, status: "offline", location, ... }

PATCH  /:id/location
  Description: Update driver location (called every 10-30 seconds)
  Body: { latitude, longitude }
  Response: Updated driver object

PATCH  /:id/status
  Description: Update driver availability status
  Body: { status: "available" | "on_trip" | "offline" }
  Response: Updated driver object

GET    /:id/ride-history
  Description: Get driver's completed rides and statistics
  Response: { driver, rides, totalRides, completedRides, cancelledRides }
```

### Ride Routes `/v1/api/rider`

```
POST   /request
  Description: Create a new ride request
  Body: { passengerName, passengerCount, pickupLatitude, pickupLongitude, 
           dropLatitude, dropLongitude, estimatedFare? }
  Response: { _id, status: "pending", driverId: null, assignmentAttempts: 0, ... }

GET    /active
  Description: List all active rides (not completed/cancelled)
  Response: Array of active ride objects

GET    /:id
  Description: Get specific ride details with populated driver info
  Response: { _id, passengerName, driverId: {driver_details}, status, ... }

PATCH  /:id/accept
  Description: Driver accepts the assigned ride
  Body: { driverId }
  Pre-condition: Ride status must be "assigned"
  Response: { status: "accepted", ... }

PATCH  /:id/reject
  Description: Driver rejects ride (triggers reassignment)
  Body: { driverId }
  Pre-condition: Ride status must be "assigned"
  Response: { status: "pending", driverId: null, ... } (reassignment triggered)

PATCH  /:id/start
  Description: Driver confirms passenger pickup
  Body: { driverId }
  Pre-condition: Ride status must be "accepted"
  Response: { status: "started", startTime, ... }

PATCH  /:id/complete
  Description: Driver confirms passenger dropoff
  Body: { driverId }
  Pre-condition: Ride status must be "started"
  Response: { status: "completed", endTime, ... }

PATCH  /:id/cancel
  Description: Cancel ride (passenger or driver initiated)
  Body: { reason? }
  Response: { status: "cancelled", cancelReason, ... }
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Redis database (local or cloud)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Akashakki-123/Ride_Matching-_Assignment_System.git
cd Ride_Matching-_Assignment_System

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Configure environment variables
# Edit .env with your MongoDB and Redis credentials
```

### Running the Server

```bash
# Production - Direct Node
npm start

# Development - Using Nodemon (auto-reload on file changes)
npm run dev

# Or run directly with nodemon
npx nodemon index.js
```

The server will start on port 8000 (or whatever PORT you set in .env)

```
Backend running on port 8000
✅ Redis connected
Datebase Connected
```

### Example `.env` Configuration
```
PORT=8000
DBUSERNAME=your_mongo_username
DBPASSWORD=your_mongo_password
DBNAME=ride_matching_db
DBLINK=cluster.mongodb.net
REDIS_URL=redis://username:password@host:port
```

---

## 🏗 Architecture

### Database Schema

**Driver Collection**
- Geospatial 2dsphere index on `location` for nearest-neighbor queries
- Status enum: `available`, `on_trip`, `offline`
- Real-time location with `lastLocationUpdatedAt` timestamp

**Ride Collection**
- Status enum: `pending`, `assigned`, `accepted`, `started`, `completed`, `cancelled`, `failed`
- `assignmentHistory`: Array of driver IDs who rejected this ride
- `assignmentAttempts`: Tracks retry count (max 3)
- GeoJSON coordinates for pickup and dropoff locations

### Request Flow

```
1. Create Ride Request
   ↓
2. Async Ride Assignment Job
   ├→ Find nearest available driver (5km radius)
   ├→ Acquire Redis lock for driver
   ├→ Verify driver still available
   ├→ Assign ride to driver
   └→ Release lock
   ↓
3. Driver Response
   ├→ Accept: Ride → "accepted" state
   ├→ Reject: Trigger reassignment for next driver
   └→ Timeout (5 min): Auto-cancel via job
   ↓
4. Ride Progression
   ├→ Start: Driver confirms pickup
   ├→ Complete: Driver confirms dropoff
   └→ Cancel: Cleanup and free driver
```

### Race Condition Handling

**Problem**: Multiple passengers requesting the same driver simultaneously

**Solution**: Redis Distributed Lock
```javascript
// Acquire lock with 10-second TTL
const lock = await acquireLock(`driver_lock_${driverId}`);
if (!lock) return retry_with_next_driver();

// Critical section: Check availability again
const available = await isDriverAvailable(driverId);
if (!available) {
  await releaseLock(key);
  return retry_with_next_driver();
}

// Assign ride
await assignRide();

// Release lock
await releaseLock(key);
```

### State Transitions

```
Ride States:
┌─────────┐
│ pending │ ← Initial state
└────┬────┘
     │ (Driver assigned)
     ↓
┌─────────────┐
│  assigned   │
└────┬────────┘
     ├→ (Driver rejects) → pending + reassign
     │
     │ (Driver accepts)
     ↓
┌─────────────┐
│  accepted   │
└────┬────────┘
     │
     │ (Driver starts)
     ↓
┌─────────────┐
│   started   │
└────┬────────┘
     ├→ (Passenger/Driver cancels) → cancelled
     │
     │ (Driver completes)
     ↓
┌────────────────┐
│   completed    │
└────────────────┘

Auto-cancel: pending/assigned → cancelled (after 5 minutes)
Failed: assigned (3 attempts) → failed
```

---

## ⚙️ Key Technical Implementations

### 1. Geospatial Queries
```javascript
// Find nearest driver within 5km using MongoDB 2dsphere index
const driver = await Driver.findOne({
  location: {
    $near: {
      $geometry: pickupLocation,
      $maxDistance: 5000  // meters
    }
  },
  status: "available",
  _id: { $nin: excludedDrivers }  // Skip previously rejected drivers
});
```

### 2. Redis Distributed Lock
```javascript
// Prevent double-booking with atomic Redis operation
const result = await redis.set(
  key, "locked", "PX", 10000, "NX"  // NX = only if not exists
);
// NX ensures only one process acquires lock
```

### 3. Real-time State Caching
```javascript
// Store driver status in Redis with 120-second TTL
await redis.set(DRIVER_STATUS_KEY(id), status, "EX", 120);

// Check status instantly without DB query
const status = await redis.get(DRIVER_STATUS_KEY(id));
```

### 4. Auto-cancel Job
```javascript
// Runs every 60 seconds, auto-cancels rides pending for 5+ minutes
const cutoffTime = new Date(Date.now() - 5 * 60 * 1000);
const expiredRides = await Ride.find({
  status: { $in: ["pending", "assigned"] },
  createdAt: { $lte: cutoffTime }
});
```

---

## 🔍 Edge Cases Handled

| Edge Case | Solution |
|-----------|----------|
| **No drivers available within 5km** | Ride marked as "failed" after 3 assignment attempts |
| **Driver goes offline while assigned** | Redis status check prevents ride start, reassignment triggered |
| **Multiple concurrent requests for same driver** | Redis lock ensures only one assignment succeeds |
| **Driver accepts but cancels immediately** | Ride resets to pending, next driver automatically assigned |
| **Network latency on location updates** | Redis TTL ensures stale data expires; DB used as source of truth |
| **Auto-cancel timeout misses ride** | Eventual consistency: next scheduled job (60s) will catch it |
| **Driver rejects 3 times in a row** | System marks ride as "failed", no further assignment attempts |

---

## 📊 Database Indexes

```javascript
// Driver Indexes
- location: "2dsphere"      // Geospatial queries
- status: 1                 // Filter by availability
- updatedAt: -1            // Quick access to recent drivers

// Ride Indexes
- status: 1                 // Filter by state
- createdAt: -1            // Sort by latest
- driverId: 1              // Quick ride lookup by driver
```

---

## 🧪 Testing the API

### Using cURL or Postman

**1. Register a Driver**
```bash
POST /v1/api/drivers/register
{
  "name": "John Doe",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "vehicleType": "sedan",
  "capacity": 4,
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

**2. Update Driver Status to Available**
```bash
PATCH /v1/api/drivers/{driverId}/status
{
  "status": "available"
}
```

**3. Create a Ride Request**
```bash
POST /v1/api/rider/request
{
  "passengerName": "Alice",
  "passengerCount": 2,
  "pickupLatitude": 28.6139,
  "pickupLongitude": 77.2090,
  "dropLatitude": 28.6300,
  "dropLongitude": 77.2200,
  "estimatedFare": 150
}
```

**4. Driver Accepts Ride**
```bash
PATCH /v1/api/rider/{rideId}/accept
{
  "driverId": "{driverId}"
}
```

**5. Driver Starts Ride**
```bash
PATCH /v1/api/rider/{rideId}/start
{
  "driverId": "{driverId}"
}
```

**6. Driver Completes Ride**
```bash
PATCH /v1/api/rider/{rideId}/complete
{
  "driverId": "{driverId}"
}
```

---

## 📁 Project Structure

```
src/api/v1/
├── config/
│   ├── mongodb.js        # MongoDB connection
│   └── redis.js          # Redis client setup
├── constants/
│   └── messageConstants.js
├── controllers/
│   ├── driver.controller.js
│   └── ride.controller.js
├── formatters/
│   ├── common.formatter.js
│   ├── driver.formatter.js
│   └── ride.formatter.js
├── helpers/
│   ├── driver.helper.js
│   ├── rideMatching.helper.js     # ⭐ Core: geospatial matching
│   ├── rideState.helper.js        # ⭐ Core: state transitions
│   └── response.helper.js
├── jobs/
│   └── autoCancel.job.js          # ⭐ Auto-cancel job
├── middlewares/
│   ├── redisLock.middleware.js
│   └── stateGuard.middleware.js
├── models/
│   ├── driver.model.js
│   └── ride.model.js
├── routes/
│   ├── driver.routes.js
│   └── ride.routes.js
└── utills/
    └── redis.util.js              # ⭐ Distributed lock logic
```

---

## 🎓 Assumptions Made

### System Design Assumptions
1. **Synchronous Assignment**: Ride assignment happens asynchronously after ride creation (fire-and-forget pattern)
2. **Location Precision**: Driver location updates every 10-30 seconds; stale data tolerance is acceptable
3. **Geofencing**: 5km radius chosen as optimal for ride matching; configurable if needed
4. **Max Retries**: 3 assignment attempts before marking ride as failed; balances between coverage and latency
5. **Auto-cancel Duration**: 5 minutes is acceptable wait time; if driver doesn't accept by then, ride is cancelled

### Concurrency Model
6. **Single-threaded Rides**: One ride can only be assigned to one driver at a time (no overbooking)
7. **Eventual Consistency**: Redis cache may be 10-120 seconds behind MongoDB; source of truth is always DB
8. **Lock Duration**: 10-second lock TTL is sufficient for lock acquisition and validation; prevents deadlocks

### Driver Behavior
9. **Driver Availability**: When driver rejects, they're assumed to be still available and open to other ride offers
10. **Location Updates**: Drivers actively push location every 10-30 seconds; system assumes regular connectivity
11. **Status Transitions**: Only one ride per driver at a time; driver must complete before accepting another

### Data Integrity
12. **No Double-booking**: Redis locks prevent simultaneous assignment attempts for same driver
13. **Ride Immutability**: Once completed/failed, ride status cannot be changed
14. **Orphan Prevention**: Auto-cancel job ensures no rides stay in "assigned" state indefinitely

### Scalability Considerations
15. **Job Interval**: Auto-cancel job runs every 60 seconds; acceptable latency for 5-minute timeout
16. **Geospatial Index**: MongoDB 2dsphere index optimized for ~1-5km queries
17. **Redis Cluster**: Assumes Redis is highly available; single point of failure for lock operations

---

## ⚠️ Known Limitations & Future Improvements

1. **No Rate Limiting**: Add per-driver request limits to prevent abuse
2. **No Input Validation**: Add Joi/Zod schemas for request validation
3. **Minimal Logging**: Implement Winston/Pino for structured logging
4. **No Unit Tests**: Add Jest/Mocha test suites for business logic
5. **No API Authentication**: Add JWT-based authentication for production
6. **Simplified Pricing**: Fare calculation is static; dynamic pricing not implemented
7. **No WebSockets**: Real-time updates currently poll-based; WebSocket can improve UX

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## 📄 License

ISC License - Feel free to use this project for educational purposes.

---

## 👤 Author

**Akash** - Machine Test Assignment

---

## 📞 Support

For issues or questions, please open a GitHub issue.

---

**Last Updated**: December 25, 2025
