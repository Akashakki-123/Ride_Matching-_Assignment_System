// ================= DRIVER =================

export const driverCreatedMessage = "Driver registered successfully";
export const driverUpdatedMessage = "Driver information updated successfully";
export const driverStatusUpdatedMessage = "Driver status updated";
export const noDriverFoundMessage = "Driver not found";
export const driverOfflineMessage = "Driver is currently offline";
export const driverBusyMessage = "Driver is already on another trip";


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


// ================= GENERAL =================

export const successMessage = "Operation successful";
export const unknownErrorMessage = "Something went wrong";
export const unauthorizedMessage = "Unauthorized access";
export const forbiddenMessage = "Access denied";
