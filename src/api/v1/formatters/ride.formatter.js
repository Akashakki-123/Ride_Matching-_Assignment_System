export function formatRideRequestData(req) {
    const {
        passengerName,
        pickupLatitude,
        pickupLongitude,
        dropLatitude,
        dropLongitude,
        passengerCount,
        estimatedFare
    } = req.body;

    return {
        passengerName,
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
