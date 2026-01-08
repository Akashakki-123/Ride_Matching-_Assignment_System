// ================= DRIVER =================

export const driverCreatedMessage = "Driver registered successfully";
export const driverUpdatedMessage = "Driver information updated successfully";
export const driverStatusUpdatedMessage = "Driver status updated";
export const noDriverFoundMessage = "Driver not found";
export const driverOfflineMessage = "Driver is currently offline";
export const driverBusyMessage = "Driver is already on another trip";

// ================= PASSENGER =================
export const passengerCreatedMessage = "Passenger registered successfully";
export const passengerLoginSuccessMessage = "Login successful";
export const passengerProfileFetchedMessage = "Passenger profile fetched";
export const passengerRideHistoryFetchedMessage = "Ride history fetched";
export const driverLoginSuccessMessage = "Login successful";
export const driverRideHistoryFetchedMessage = "Ride history fetched";


// ================= RIDE =================

export const rideRequestCreatedMessage = "Ride request created successfully";
export const rideDetailsSuccessMessage = "Ride details fetched successfully";
export const rideAssignedMessage = "Ride assigned to driver";
export const rideAcceptedMessage = "Ride accepted by driver";
export const rideStartedMessage = "Ride started successfully";
export const rideCompletedMessage = "Ride completed successfully";
export const rideCancelledMessage = "Ride cancelled successfully";
export const rideFailedMessage = "Ride could not be assigned to any driver";

export const noRideFoundMessage = "Ride not found";
export const invalidRideStateMessage = "Invalid ride state transition";
export const noDriverAvailableMessage = "No available drivers found within 5 km radius";
// Authentication / Registration
export const emailPasswordRequiredMessage = "Email and password required";
export const fullRegistrationRequiredMessage = "Email, phone number, name and password are required";
export const userAlreadyExistsMessage = "User with this email or phone already exists";
export const invalidPasswordMessage = "Invalid password";
export const userNotFoundMessage = "User not found";
export const accountInactiveMessage = "Account is inactive";


// ================= ASSIGNMENT / MATCHING =================

export const maxAssignmentAttemptMessage =
  "Maximum driver assignment attempts reached";

export const reassignmentMessage =
  "Reassigning ride to next nearest driver";


// ================= REDIS / CONCURRENCY =================

export const driverLockFailedMessage =
  "Driver is currently busy, please try again";

export const redisConnectionErrorMessage =
  "Redis connection error";


// ================= VALIDATION =================

export const invalidRequestDataMessage = "Invalid request data";
export const missingRequiredFieldMessage = "Required field is missing";

export const invalidOrExpiredTokenMessage = "Invalid or expired token";


// ================= GENERAL =================

export const successMessage = "Operation successful";
export const unknownErrorMessage = "Something went wrong";
export const unauthorizedMessage = "Unauthorized access";
export const forbiddenMessage = "Access denied";
export const authorizationRequiredMessage = "Authorization token required";
export const driverAuthorizationRequiredMessage = "Driver authorization required";
export const passengerAuthorizationRequiredMessage = "Passenger authorization required";
