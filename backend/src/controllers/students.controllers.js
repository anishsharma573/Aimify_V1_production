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

const getStudentsByClass = asyncHandler(async (req, res) => {
  const { className } = req.params; // Assuming the class is passed as a URL parameter

  // Find students by class
  const students = await User.find({ role: "student", className });

  // If no students are found, return an error
  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found for the provided class.");
  }

  // Get the total number of students
  const totalStudents = await User.countDocuments({ role: "student", className });

  // Return the list of students and total count
  return res.status(200).json(
    new ApiResponse(200, { students, totalStudents }, "Students found successfully.")
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




export { studentLogin ,getStudentsByClass ,updateStudentProfile};
