export function formatRideRequestData(req) {
    const {
        pickupLatitude,
        pickupLongitude,
        dropLatitude,
        dropLongitude,
        passengerCount,
        estimatedFare
    } = req.body;

    // Get passenger info from authenticated request
    const passengerId = req.userId;
    const passengerName = req.passengerName || req.body.passengerName;
    const passengerPhone = req.body.passengerPhone;
    const passengerEmail = req.body.passengerEmail;

    return {
        passengerId,
        passengerName,
        passengerPhone: passengerPhone || req.body.phoneNumber,
        passengerEmail: passengerEmail || req.body.email,
        passengerCount,
        estimatedFare: estimatedFare || 0,
        pickupLocation: {
            type: "Point",
            coordinates: [pickupLongitude, pickupLatitude]
        },
        dropoffLocation: {
            type: "Point",
            coordinates: [dropLongitude, dropLatitude]
        }
    };
}

export function formatRideCancelData(req) {
    const { reason } = req.body;
    return { cancelReason: reason };
}
