import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Secret key from environment
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const SALT_ROUNDS = 10;

// Hash password
export async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

// Compare password
export async function comparePassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
}

// Generate JWT token
export function generateToken(userId, userType) {
  try {
    return jwt.sign(
      { userId, userType },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

// Decode token without verification (for debugging)
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
}
