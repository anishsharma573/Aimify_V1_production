import { User } from "../models/user.models.js";
import { School } from "../models/school.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
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
  // Require subdomain from the request body
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
    role: "student",
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
const getStudentsByClassAndSubdomain  = asyncHandler(async (req, res) => {
  const { className, subdomain } = req.query; // Extract className and subdomain from query parameters

  // Validate if className and subdomain are provided
  if (!className || !subdomain) {
    throw new ApiError(400, "Both className and subdomain are required.");
  }

  // Find students by className and populate schoolId to get subdomain
  const students = await User.find({ role: "student", className })
    .populate({
      path: 'schoolId', // Populate the schoolId field from the User model
      select: 'subdomain' // Select only the subdomain field from the School model
    });

  // Filter students by subdomain (matching the subdomain from the query)
  const filteredStudents = students.filter(student => student.schoolId.subdomain === subdomain);

  // If no students are found, return an error
  if (!filteredStudents || filteredStudents.length === 0) {
    throw new ApiError(404, "No students found for the provided class and subdomain.");
  }

  // Get the total number of students
  const totalStudents = filteredStudents.length;

  // Return the list of students and total count
  return res.status(200).json(
    new ApiResponse(200, { students: filteredStudents, totalStudents }, "Students found successfully.")
  );
});


 const updateStudentProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Get the student ID from URL parameter
  const student = await User.findById(userId);

  // Check if the student exists
  if (!student) {
    throw new ApiError(404, "Student not found");
  }

  // Ensure the logged-in user can only update their own profile
  if (student._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only update your own profile");
  }

  // Get the fields from the request body
  const {
    name,
    
    dateOfBirth,
    phone,
    location,
    className,
    profile,
    hobbies,
    idol,
    goals,
    academics,
    skills,
    parents,
  } = req.body;

  // Logo Upload
  let logoUrl = student.logo; // Keep existing logo if no new file is provided
  if (req.file) {
    // If a file is provided, upload it to Cloudinary
    const result = await uploadOnCloudinary(req.file.path);
    if (!result) {
      throw new ApiError(500, "Error uploading logo to Cloudinary");
    }
    logoUrl = result.secure_url;
  }

  // Update the student profile fields
  if (name) student.name = name;
 
  if (dateOfBirth) student.dateOfBirth = dateOfBirth;
  if (phone) student.phone = phone;
  if (location) student.location = location;
  if (className) student.className = className;
  if (profile) student.profile = { ...student.profile, ...profile };
  if (hobbies) student.hobbies = hobbies;
  if (idol) student.idol = idol;
  if (goals) student.goals = goals;
  if (academics) student.academics = academics;
  if (skills) student.skills = skills;
  if (parents) student.parents = parents;

  // Update logo (profile picture)
  student.logo = logoUrl;

  // Save the updated student profile
  const updatedStudent = await student.save();

  // Return the updated profile
  res.status(200).json({
    message: "Profile updated successfully",
    data: updatedStudent,
  });
});




export { studentLogin ,getStudentsByClassAndSubdomain  ,updateStudentProfile};
