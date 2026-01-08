export function formatDriverRegisterData(req) {
    const {
        name,
        phoneNumber,
        email,
        password,
        vehicleType,
        capacity,
        latitude,
        longitude
    } = req.body;

    return {
        name,
        phoneNumber,
        email,
        password,
        vehicleType,
        capacity,
        location: {
            type: "Point",
            coordinates: [longitude, latitude]
        },
        status: "offline"
    };
}

export function formatDriverLocationUpdate(req) {
    const {
        latitude,
        longitude
    } = req.body;

    return {
        location: {
            type: "Point",
            coordinates: [longitude, latitude]
        },
        lastLocationUpdatedAt: new Date()
    };
}

export function formatDriverStatusUpdate(req) {
    const { status } = req.body;

    return { status };
}
