# Quick Start Guide - JWT Authentication

## 1. Driver Registration & Login Flow

### Step 1: Register as Driver
```bash
curl -X POST http://localhost:3000/api/drivers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "phoneNumber": "9876543210",
    "password": "driver@123",
    "vehicleType": "sedan",
    "capacity": 4,
    "latitude": 12.9716,
    "longitude": 77.5946
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Driver registered successfully",
  "data": {
    "_id": "63f7d00000000000000000000",
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 2: Login as Driver
```bash
curl -X POST http://localhost:3000/api/drivers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "raj@example.com",
    "password": "driver@123"
  }'
```

### Step 3: Update Location (Protected)
```bash
curl -X PATCH http://localhost:3000/api/drivers/63f7d00000000000000000000/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "latitude": 13.0849,
    "longitude": 80.2707
  }'
```

### Step 4: Update Status (Protected)
```bash
curl -X PATCH http://localhost:3000/api/drivers/63f7d00000000000000000000/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "status": "available"
  }'
```

### Step 5: View Ride History (Protected)
```bash
curl -X GET http://localhost:3000/api/drivers/63f7d00000000000000000000/ride-history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 2. Passenger Registration & Login Flow

### Step 1: Register as Passenger
```bash
curl -X POST http://localhost:3000/api/passengers/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "phoneNumber": "9876543211",
    "password": "passenger@123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Passenger registered successfully",
  "data": {
    "_id": "63f7d00000000000000000001",
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 2: Login as Passenger
```bash
curl -X POST http://localhost:3000readme file me changes karo/api/passengers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@example.com",
    "password": "passenger@123"
  }'
```

### Step 3: Get Profile (Protected)
```bash
curl -X GET http://localhost:3000/api/passengers/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 3. Ride Request & Management Flow

### Step 1: Create Ride Request (Protected - Passenger Only)
```bash
curl -X POST http://localhost:3000/api/rider/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer PASSENGER_TOKEN_HERE" \
  -d '{
    "pickupLatitude": 12.9716,
    "pickupLongitude": 77.5946,
    "dropLatitude": 13.0849,
    "dropLongitude": 80.2707,
    "passengerCount": 2,
    "estimatedFare": 150
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Ride request created",
  "data": {
    "_id": "63f7d00000000000000000002",
    "passengerId": "63f7d00000000000000000001",
    "passengerName": "Priya Sharma",
    "passengerPhone": "9876543211",
    "passengerEmail": "priya@example.com",
    "status": "pending",
    "driverId": null,
    "estimatedFare": 150,
    "pickupLocation": {
      "type": "Point",
      "coordinates": [77.5946, 12.9716]
    },
    "dropoffLocation": {
      "type": "Point",
      "coordinates": [80.2707, 13.0849]
    }
  }
}
```

### Step 2: Get Active Rides (Protected - Any Auth)
```bash
curl -X GET http://localhost:3000/api/rider/active \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Get Ride Details (Protected - Any Auth)
```bash
curl -X GET http://localhost:3000/api/rider/63f7d00000000000000000002 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 4: Driver Accepts Ride (Protected - Driver Only)
```bash
curl -X PATCH http://localhost:3000/api/rider/63f7d00000000000000000002/accept \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE" \
  -d '{
    "driverId": "63f7d00000000000000000000"
  }'
```

### Step 5: Driver Starts Ride (Protected - Driver Only)
```bash
curl -X PATCH http://localhost:3000/api/rider/63f7d00000000000000000002/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE" \
  -d '{
    "driverId": "63f7d00000000000000000000"
  }'
```

### Step 6: Driver Completes Ride (Protected - Driver Only)
```bash
curl -X PATCH http://localhost:3000/api/rider/63f7d00000000000000000002/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DRIVER_TOKEN_HERE" \
  -d '{
    "driverId": "63f7d00000000000000000000",
    "actualFare": 155
  }'
```

### Step 7: Cancel Ride (Protected - Any Auth)
```bash
curl -X PATCH http://localhost:3000/api/rider/63f7d00000000000000000002/cancel \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "reason": "Driver not responding"
  }'
```

---

## Token Format

All protected endpoints require this header:
```
Authorization: Bearer <jwt_token>
```

The token payload contains:
```json
{
  "userId": "63f7d00000000000000000000",
  "userType": "driver" | "passenger",
  "iat": 1694525000,
  "exp": 1695130000
}
```

---

## Error Scenarios

### 1. Missing Authorization Header
**Response:**
```json
{
  "success": false,
  "message": "Authorization token required",
  "data": {}
}
```

### 2. Invalid/Expired Token
**Response:**
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": {}
}
```

### 3. Wrong User Type
**Example:** Passenger trying to accept a ride (driver-only)
```json
{
  "success": false,
  "message": "Driver authorization required",
  "data": {}
}
```

### 4. Duplicate Registration
**Response:**
```json
{
  "success": false,
  "message": "Driver with this email or phone already exists",
  "data": undefined
}
```

### 5. Invalid Credentials
**Response:**
```json
{
  "success": false,
  "message": "Invalid password",
  "data": undefined
}
```

---

## Important Notes

1. **Password Security**: All passwords are hashed using bcrypt and never returned in responses
2. **Token Expiry**: Tokens are valid for 7 days, after which re-login is required
3. **User Type Validation**: Middleware ensures drivers and passengers can only access their respective endpoints
4. **Passenger Data in Rides**: When a passenger creates a ride, their details are automatically captured
5. **Status Tracking**: Last login time is tracked for both drivers and passengers
6. **No Password Changes**: Current implementation doesn't have password change endpoint (recommended addition)

---

## Debugging Tips

1. **Verify Token**: Decode JWT at https://jwt.io to inspect token payload
2. **Check Headers**: Ensure `Authorization: Bearer` format (with space after Bearer)
3. **Check User Type**: Confirm token has correct `userType` for the endpoint
4. **Email/Phone Check**: Each user must have unique email and phone number
5. **MongoDB Indexes**: Ensure MongoDB has created indexes on email and phoneNumber fields
