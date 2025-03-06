import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import xlsx from "xlsx";
import { School } from "../models/school.models.js";
import bcrypt from "bcryptjs";
import { ApiError } from "../utils/ApiError.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
      console.log("Generating tokens for User ID:", userId);

      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
          console.error("User not found for ID:", userId);
          throw new ApiError(404, "User not found");
      }

      // Generate tokens
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      console.log("Access Token Generated:", accessToken);
      console.log("Refresh Token Generated:", refreshToken);

      // Save refresh token to user document
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      return { accessToken, refreshToken };
  } catch (error) {
      console.error("Error in generateRefreshAndRefreshToken:", error.message);
      throw new ApiError(
          500,
          "Something went wrong while generating the access token and refresh token"
      );
  }
};

export { generateAccessAndRefreshToken };


const schoolAdminLogin = asyncHandler(async (req, res, next) => {
    // Extract username and password from the request body
    const { username, password } = req.body;
    if (!username || !password) {
        throw new ApiError(400, "Username and password are required");
    }

    // Find the user by username and ensure the user is a school admin
    const user = await User.findOne({ username });
    if (!user || user.role !== "school_admin") {
        throw new ApiError(400, "Invalid credentials or unauthorized user");
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordvalid=await user.isPasswordCorrect(password)
    if (!isPasswordvalid) {
        throw new ApiError(400, "Username and Password do not match");
    }

    // Generate access and refresh tokens for the logged-in user
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Retrieve the logged in user without sensitive fields
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Retrieve the school data associated with the logged-in admin
    const schoolData = await School.findById(user.schoolId);
    if (!schoolData) {
        throw new ApiError(404, "Associated school not found");
    }

    // Cookie options similar to masterAdminLogin
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    // Return the tokens, user details, and the school data as cookies and in the response body
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            data: {
                user: loggedInUser,
                school: schoolData,
                accessToken,
                refreshToken
            },
            message: "Login successful. School data retrieved."
        }));
});



const addStudent = asyncHandler(async (req, res, next) => {
const { schoolId } = req.params;
if (!req.user.schoolId || req.user.schoolId.toString() !== schoolId) {
  return res.status(403).json({ message: "Not authorized for this school" });
}
  let usersData = [];
  if (req.file) {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      return res.status(400).json({ message: "No users found in file" });
    }
    usersData = sheetData;
  } else {
    if (req.body.users) {
      usersData = Array.isArray(req.body.users) ? req.body.users : [req.body.users];
    } else {
      usersData = [req.body];
    }
  }

  // Retrieve the flag from the request. Set to true to skip duplicates.
  const skipDuplicates = req.body.skipDuplicates || false;

  // Prepare new users data
  let newUsersData = [];
  for (const user of usersData) {
    if (!["teacher", "student"].includes(user.role)) {
      return res.status(400).json({ message: `Invalid role for user: ${user.username}` });
    }
    if (!user.phone || !user.name) {
      return res.status(400).json({ message: `Both phone and name are required for user: ${user.username}` });
    }
    // Hash the provided password (assumes user.password is provided)
    const hashedPassword = await bcrypt.hash(user.password, 10);
    newUsersData.push({
      username: user.username,
      phone: user.phone,
      name: user.name,
      password: hashedPassword,
      role: user.role,
      school: schoolId,
    });
  }

  // Build queries to find duplicates based on matching name and phone in the same school.
  const duplicateQueries = newUsersData.map(u => ({ name: u.name, phone: u.phone }));
  const duplicates = await User.find({ school: schoolId, $or: duplicateQueries });

  if (duplicates.length > 0 && !skipDuplicates) {
    // If duplicates exist and the client hasn't set the flag to skip them,
    // notify the client about the duplicates.
    return res.status(400).json({
      message:
        "Duplicate entries found for the following users. Set skipDuplicates to true if you want to skip these duplicates.",
      duplicates,
    });
  }

  // If skipDuplicates is true, filter out duplicate entries.
  let skippedDuplicates = [];
  if (duplicates.length > 0 && skipDuplicates) {
    // Create a set of duplicate identifiers (combination of name and phone)
    const duplicateSet = duplicates.map(d => `${d.name}_${d.phone}`);
    const filteredUsers = newUsersData.filter(u => {
      if (duplicateSet.includes(`${u.name}_${u.phone}`)) {
        skippedDuplicates.push(u);
        return false;
      }
      return true;
    });
    newUsersData = filteredUsers;
  }

  if (newUsersData.length === 0) {
    return res.status(200).json({
      message: "All entries were duplicates. No new students added.",
      skippedDuplicates,
    });
  }

  const createdUsers = await User.insertMany(newUsersData);
  return res.status(201).json({
    message: "Students added successfully.",
    createdUsers,
    skippedDuplicates,
  });
});


export  {addStudent , schoolAdminLogin }