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

const studentLogin = asyncHandler(async (req, res, next) => {
  // Check if the client provided a subdomain; otherwise, derive it from the host header.
  const clientSubdomain = req.body.subdomain;
  let hostSubdomain = req.headers.host;
  if (hostSubdomain.includes(":")) {
    hostSubdomain = hostSubdomain.split(":")[0];
  }
  const subdomain = clientSubdomain || hostSubdomain.split(".")[0].toLowerCase();

  console.log("Host:", req.headers.host);
  console.log("Extracted subdomain:", subdomain);

  // Lookup the school based on the subdomain.
  const school = await School.findOne({ subdomain });
  console.log("Found school:", school);

  if (!school) {
    throw new ApiError(404, "School not found for the provided subdomain");
  }

  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }
  
  const student = await User.findOne({ username, schoolId: school._id, role: "student" });
  if (!student) {
    throw new ApiError(400, "Invalid credentials or user does not belong to this school");
  }
  
  const isPasswordValid = await student.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid password");
  }
  
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(student._id);
  const loggedInUser = await User.findById(student._id).select("-password -refreshToken");
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
        "Student login successful."
      )
    );
});



export { studentLogin };
