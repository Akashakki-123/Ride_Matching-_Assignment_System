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

## 🔐 Authentication & Authorization

This project now includes JWT-based authentication and role-based authorization for Drivers and Passengers.

- Authentication: JSON Web Tokens (JWT) are used to authenticate requests.
- Passwords: All passwords are hashed using bcrypt before being stored.
- Roles: `driver` and `passenger` — middleware enforces role-specific endpoints.

### New / Updated Endpoints

Driver
- `POST /api/drivers/register`
  Body: { name, phoneNumber, email, password, vehicleType, capacity, latitude, longitude }
  Response: { _id, name, email, token, ... } (returns JWT token)

- `POST /api/drivers/login`
  Body: { email, password }
  Response: { token, driver }

Passenger
- `POST /api/passengers/register`
  Body: { name, phoneNumber, email, password }
  Response: { _id, name, email, token, ... }

- `POST /api/passengers/login`
  Body: { email, password }
  Response: { token, passenger }

Ride
- `POST /api/rider/request` (protected - passenger)
  - Requires header: `Authorization: Bearer <token>`
  - Passenger details are automatically attached from the authenticated user token; keep the request body fields for pickup/dropoff and passengerCount.

### Environment variables

Add these to your `.env`:
```
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d
```

Security note: use a strong `JWT_SECRET` in production and rotate it as needed. Tokens expire by default (see `JWT_EXPIRY`).


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

## 🗂 Project Structure

A high-level view of the repository and important folders/files:

- app.js
- index.js
- package.json
- README.md
- .env.example
- AUTHENTICATION.md
- QUICKSTART.md
- src/
  - api/
    - v1/
      - index.js
      - config/
        - mongodb.js
        - redis.js
      - constants/
        - messageConstants.js
      - controllers/
        - driver.controller.js
        - ride.controller.js
        - passenger.controller.js
      - formatters/
        - common.formatter.js
        - driver.formatter.js
        - ride.formatter.js
        - passenger.formatter.js
      - helpers/
        - driver.helper.js
        - passenger.helper.js
        - response.helper.js
        - rideMatching.helper.js
        - rideState.helper.js
      - jobs/
        - autoCancel.job.js
      - middlewares/
        - auth.middleware.js
        - redisLock.middleware.js
        - stateGuard.middleware.js
      - models/
        - driver.model.js
        - passenger.model.js
        - ride.model.js
      - routes/
        - driver.routes.js
        - passenger.routes.js
        - ride.routes.js
      - utills/
        - auth.util.js
        - redis.util.js


## 🔁 Recent Changes (Authentication & model updates)

I added JWT-based authentication (driver & passenger), updated the ride model to include passenger details, and centralized user-facing messages in `src/api/v1/constants/messageConstants.js`.

Key files added:
- `src/api/v1/models/passenger.model.js` — Passenger model with hashed password
- `src/api/v1/utills/auth.util.js` — Password hashing and JWT helper functions
- `src/api/v1/middlewares/auth.middleware.js` — `verifyAuth`, `verifyDriverAuth`, `verifyPassengerAuth`
- `src/api/v1/helpers/passenger.helper.js` and `src/api/v1/controllers/passenger.controller.js` — Passenger register/login/profile
- `src/api/v1/routes/passenger.routes.js` — Passenger routes

Key files updated:
- `src/api/v1/models/driver.model.js` — added `password`, `isActive`, `lastLoginAt`, made email/phone unique
- `src/api/v1/models/ride.model.js` — added `passengerId`, `passengerPhone`, `passengerEmail`, added indexes (passengerId, pickup/dropoff 2dsphere)
- `src/api/v1/helpers/driver.helper.js` — driver register/login (password hashing, token generation)
- `src/api/v1/controllers/driver.controller.js` — added login controller
- `src/api/v1/formatters/driver.formatter.js` and `src/api/v1/formatters/ride.formatter.js` — capture password on register and passenger info from auth context
- `src/api/v1/routes/ride.routes.js` and `src/api/v1/index.js` — protected routes and passenger route registration
- `src/api/v1/helpers/*` and `src/api/v1/middlewares/*` — swapped hardcoded messages for centralized constants

Notes:
- Set `JWT_SECRET` and `JWT_EXPIRY` in your `.env` before testing.
- Existing drivers in the DB without passwords will need a migration or password reset.

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

