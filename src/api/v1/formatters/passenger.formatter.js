export function formatPassengerRegisterData(req) {
    const { name, phoneNumber, email, password } = req.body;

    return {
        name,
        phoneNumber,
        email,
        password
    };
}

export function formatPassengerLoginData(req) {
    const { email, password } = req.body;

    return {
        email,
        password
    };
}
