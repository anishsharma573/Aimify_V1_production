import { User } from "../models/user.models.js";
import { School } from "../models/school.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};
const teacherLogin = asyncHandler(async (req, res, next) => {
  const { subdomain, username, password } = req.body;

  if (!subdomain) {
    throw new ApiError(400, "Subdomain is required in the request body");
  }

  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  console.log("Subdomain from body:", subdomain);

  // Lookup the school based on the subdomain
  const school = await School.findOne({ subdomain });
  console.log("Found school:", school);

  if (!school) {
    throw new ApiError(404, "School not found for the provided subdomain");
  }

  // Find the student by username, role, and schoolId
  const student = await User.findOne({
    username,
    schoolId: school._id,
    role: "teacher",
  });

  if (!student) {
    throw new ApiError(
      400,
      "Invalid credentials or user does not belong to this school"
    );
  }

  // Validate the password
  const isPasswordValid = await student.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    student._id
  );

  // Remove sensitive fields before sending the user back
  const loggedInUser = await User.findById(student._id).select(
    "-password -refreshToken"
  );

  // Set cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, school, accessToken, refreshToken },
        "Student login successful."
      )
    );
});


export { teacherLogin };
