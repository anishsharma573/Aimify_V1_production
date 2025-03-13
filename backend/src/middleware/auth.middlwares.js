import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header or cookies
  const authHeader = req.header("Authorization");
  const token = authHeader?.replace("Bearer ", "") || req.cookies.accessToken;

  // Debug logging to see what's being received
  console.log("Authorization Header:", authHeader);
  console.log("Cookies:", req.cookies);
  console.log("Token received for verification:", token);

  if (!token) {
    console.error("No token provided");
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    // Ensure the secret is defined
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined in the environment variables");
    }

    // Verify token
    const decodedToken = jwt.verify(token, secret);
    console.log("Decoded Token:", decodedToken);

    // Find the user in the database using the _id from the token
    const user = await User.findById(decodedToken._id);
    if (!user) {
      console.error("User not found for the given token");
      throw new ApiError(401, "Unauthorized: User not found");
    }

    // Attach the user data to the request object (excluding sensitive fields)
    req.user = {
      _id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      schoolId: user.schoolId,
    };
    console.log("Attached User to Request:", req.user);

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    // Handle specific token errors
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token has expired. Please log in again.");
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token. Please log in again.");
    }
    // Handle other errors
    throw new ApiError(401, "Unauthorized: " + (error.message || "Invalid token"));
  }
});
