import Ride from "../models/ride.model.js";

export function allowRideStates(allowedStates = []) {
  return async function (req, res, next) {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (!allowedStates.includes(ride.status)) {
      return res.status(400).json({
        message: `Invalid ride state transition from ${ride.status}`
      });
    }

    req.ride = ride;
    next();
  };
}
