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

const teacherLogin = asyncHandler(async (req, res) => {
  let host = req.headers.host;
  if (host.includes(":")) {
    host = host.split(":")[0];
  }
  const subdomain = host.split(".")[0];
  const school = await School.findOne({ subdomain });
  if (!school) {
    throw new ApiError(404, "School not found for the provided subdomain");
  }
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }
  const teacher = await User.findOne({ username, schoolId: school._id, role: "teacher" });
  if (!teacher) {
    throw new ApiError(400, "Invalid credentials or user does not belong to this school");
  }
  const isPasswordValid = await teacher.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(teacher._id);
  const loggedInUser = await User.findById(teacher._id).select("-password -refreshToken");
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, school, accessToken, refreshToken },
        "Teacher login successful."
      )
    );
});

export { teacherLogin };
