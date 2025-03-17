import { User } from "../models/user.models.js";
import { School } from "../models/school.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import xlsx from "xlsx";

// Helper to generate access and refresh tokens for a user
const generateAccessAndRefreshToken = async (userId) => {
  try {
    console.log("Generating tokens for User ID:", userId);
    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found for ID:", userId);
      throw new ApiError(404, "User not found");
    }
    // Generate tokens using instance methods
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    console.log("Access Token Generated:", accessToken);
    console.log("Refresh Token Generated:", refreshToken);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error.message);
    throw new ApiError(
      500,
      "Something went wrong while generating the access token and refresh token"
    );
  }
};

const parseDateFromDDMMYY = (dateStr) => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    throw new Error("Invalid date format. Expected DD-MM-YY or DD-MM-YYYY format.");
  }
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);
  // If the year is given as two digits, assume it's 2000+
  if (year < 100) {
    year += 2000;
  }
  return new Date(year, month - 1, day);
};

// School Admin Login Controller
const schoolAdminLogin = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }
  // Find user by username and check if they're a school admin
  const user = await User.findOne({ username });
  if (!user || user.role !== "school_admin") {
    throw new ApiError(400, "Invalid credentials or unauthorized user");
  }
  // Verify the entered password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(400, "Username and Password do not match");
  }
  // Generate tokens
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
  // Get logged-in user without sensitive fields
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  // Get associated school data
  const schoolData = await School.findById(user.schoolId);
  if (!schoolData) {
    throw new ApiError(404, "Associated school not found");
  }
  // Cookie options
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          school: schoolData,
          accessToken,
          refreshToken,
        },
        "Login successful. School data retrieved."
      )
    );
});

// Add Student Controller
const addStudent = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.params;

  // Authorization: Ensure the logged-in user's school matches the target school.
  if (!req.user.schoolId || req.user.schoolId.toString() !== schoolId) {
    throw new ApiError(403, "Not authorized for this school");
  }

  // Retrieve the school document to get the school's name.
  const school = await School.findById(schoolId);
  if (!school) {
    throw new ApiError(404, "School not found");
  }
  // Create a slug version of the school name (uppercase, no spaces)
  const schoolNameSlug = school.subdomain.toUpperCase().replace(/\s+/g, "");

  // Get the current count of student records for this school
  let studentCounter = await User.countDocuments({ schoolId: schoolId, role: "student" });

  let studentsData = [];

  // Process Excel file if provided
  if (req.file) {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      throw new ApiError(400, "No student records found in file");
    }
    studentsData = sheetData;
  } else {
    // Otherwise, expect JSON data in the request body
    if (req.body.students) {
      // If "students" is a string, parse it to JSON.
      if (typeof req.body.students === "string") {
        try {
          studentsData = JSON.parse(req.body.students);
        } catch (error) {
          throw new ApiError(400, "Invalid JSON in students field");
        }
      } else {
        studentsData = req.body.students;
      }
      // Ensure we have an array
      if (!Array.isArray(studentsData)) {
        studentsData = [studentsData];
      }
    } else {
      studentsData = [req.body];
    }
  }

  // Retrieve flag to skip duplicates if needed (defaults to false)
  const skipDuplicates = req.body.skipDuplicates || false;
  let newStudentsData = [];
  console.log("student daTA", studentsData);

  // Process each student record
  for (const student of studentsData) {
    // Validate required fields.
    if (!student.phone || !student.name) {
      throw new ApiError(
        400,
        `Both phone and name are required for student: ${student.username || student.name}`
      );
    }
    if (!student.dateOfBirth) {
      throw new ApiError(
        400,
        `Date of birth is required for student: ${student.username || student.name}`
      );
    }

    let dateObj;
    try {
      // Parse the date from the provided format (DD-MM-YYYY).
      dateObj = parseDateFromDDMMYY(student.dateOfBirth);
    } catch (error) {
      throw new ApiError(
        400,
        `Invalid dateOfBirth for student: ${student.username || student.name}. ${error.message}`
      );
    }

    // Generate password in "DDMMYYYY" format from the parsed date.
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const yearFull = dateObj.getFullYear().toString();
    const rawPassword = `${day}${month}${yearFull}`; // e.g., "16052003"
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Auto-generate username if not provided.
    let username = student.username;
    if (!username) {
      studentCounter++;
      username = `AIM${schoolNameSlug}${studentCounter.toString().padStart(5, "0")}`;
    }

    newStudentsData.push({
      username, // Auto-generated if not provided
      phone: student.phone,
      name: student.name,
      password: hashedPassword,
      role: "student",
      schoolId: schoolId,
      dateOfBirth: dateObj,
      // Use "className" if available; otherwise, try "class" from the input.
      className: student.className || student.class,
    });
  }

  // Check for duplicate entries based on matching name and phone within the school.
  const duplicateQueries = newStudentsData.map(u => ({ name: u.name, phone: u.phone }));
  const duplicates = await User.find({ schoolId: schoolId, $or: duplicateQueries });

  if (duplicates.length > 0 && !skipDuplicates) {
    throw new ApiError(
      400,
      "Duplicate entries found for the following students. Set skipDuplicates to true to skip duplicates",
      { duplicates }
    );
  }

  let skippedDuplicates = [];
  if (duplicates.length > 0 && skipDuplicates) {
    const duplicateSet = duplicates.map(d => `${d.name}_${d.phone}`);
    newStudentsData = newStudentsData.filter(u => {
      if (duplicateSet.includes(`${u.name}_${u.phone}`)) {
        skippedDuplicates.push(u);
        return false;
      }
      return true;
    });
  }

  if (newStudentsData.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { skippedDuplicates }, "All entries were duplicates. No new students added."));
  }

  const createdStudents = await User.insertMany(newStudentsData);
  return res
    .status(201)
    .json(new ApiResponse(201, { createdStudents, skippedDuplicates }, "Students added successfully."));
});

// Add Teacher Controller
const addTeacher = asyncHandler(async (req, res, next) => {
  const { schoolId } = req.params;

  // Authorization: Ensure the logged-in user's school matches the target school.
  if (!req.user.schoolId || req.user.schoolId.toString() !== schoolId) {
    throw new ApiError(403, "Not authorized for this school");
  }

  // Retrieve the school document to get the school's name.
  const school = await School.findById(schoolId);
  if (!school) {
    throw new ApiError(404, "School not found");
  }
  // Create a slug version of the school name (uppercase, no spaces)
  const schoolNameSlug = school.subdomain.toUpperCase().replace(/\s+/g, "");

  // Get the current count of teacher records for this school.
  let teacherCounter = await User.countDocuments({ schoolId: schoolId, role: "teacher" });

  let teachersData = [];
  // Process Excel file if provided.
  if (req.file) {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      throw new ApiError(400, "No teacher records found in file");
    }
    teachersData = sheetData;
  } else {
    // Otherwise, expect JSON data in the request body.
    if (req.body.teachers) {
      // If "teachers" is a string, parse it.
      if (typeof req.body.teachers === "string") {
        try {
          teachersData = JSON.parse(req.body.teachers);
        } catch (error) {
          throw new ApiError(400, "Invalid JSON in teachers field");
        }
      } else {
        teachersData = req.body.teachers;
      }
      // Ensure teachersData is an array.
      if (!Array.isArray(teachersData)) {
        teachersData = [teachersData];
      }
    } else {
      teachersData = [req.body];
    }
  }

  // Retrieve flag to skip duplicates if needed (defaults to false).
  const skipDuplicates = req.body.skipDuplicates || false;
  let newTeachersData = [];
  console.log("req", teachersData);

  // Process each teacher record.
  for (const teacher of teachersData) {
    // Validate required fields.
    if (!teacher.phone || !teacher.name) {
      throw new ApiError(
        400,
        `Both phone and name are required for teacher: ${teacher.username || teacher.name}`
      );
    }
    if (!teacher.dateOfBirth) {
      throw new ApiError(
        400,
        `Date of birth is required for teacher: ${teacher.username || teacher.name}`
      );
    }

    let dateObj;
    try {
      // Parse the date from the provided format (e.g., "DD-MM-YYYY").
      dateObj = parseDateFromDDMMYY(teacher.dateOfBirth);
    } catch (error) {
      throw new ApiError(
        400,
        `Invalid dateOfBirth for teacher: ${teacher.username || teacher.name}. ${error.message}`
      );
    }

    // Generate password in "DDMMYYYY" format from the parsed date.
    const day = dateObj.getDate().toString().padStart(2, "0");
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const yearFull = dateObj.getFullYear().toString();
    const rawPassword = `${day}${month}${yearFull}`; // e.g., "16052003"
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Auto-generate username if not provided.
    let username = teacher.username;
    if (!username) {
      teacherCounter++;
      username = `AIMTECH${schoolNameSlug}${teacherCounter.toString().padStart(5, "0")}`;
    }

    newTeachersData.push({
      username, // Auto-generated if not provided.
      name: teacher.name,
      phone: teacher.phone,
      password: hashedPassword,
      role: "teacher",
      schoolId: schoolId,
      dateOfBirth: dateObj,
      // Use "className" if available; otherwise, use teacher.class if provided.
      className: teacher.className || teacher.class,
    });
  }

  // Check for duplicate entries based on matching name and phone within the school.
  const duplicateQueries = newTeachersData.map(u => ({ name: u.name, phone: u.phone }));
  const duplicates = await User.find({ schoolId: schoolId, $or: duplicateQueries });

  if (duplicates.length > 0 && !skipDuplicates) {
    throw new ApiError(
      400,
      "Duplicate entries found for the following teachers. Set skipDuplicates to true to skip duplicates",
      { duplicates }
    );
  }

  let skippedDuplicates = [];
  if (duplicates.length > 0 && skipDuplicates) {
    const duplicateSet = duplicates.map(d => `${d.name}_${d.phone}`);
    newTeachersData = newTeachersData.filter(u => {
      if (duplicateSet.includes(`${u.name}_${u.phone}`)) {
        skippedDuplicates.push(u);
        return false;
      }
      return true;
    });
  }

  if (newTeachersData.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, { skippedDuplicates }, "All entries were duplicates. No new teachers added."));
  }

  const createdTeachers = await User.insertMany(newTeachersData);
  return res
    .status(201)
    .json(new ApiResponse(201, { createdTeachers, skippedDuplicates }, "Teachers added successfully."));
});

const showStudents = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;
  if (!schoolId) {
    throw new ApiError(400, "School ID is required");
  }

  // Extract query parameters for pagination and filtering
  const { page = 1, limit = 20, search = "", className: classFilter } = req.query;

  // Build filter object using "className" instead of "class"
  const filter = { schoolId, role: "student" };
  if (classFilter) {
    filter.className = classFilter;
  }
  if (search) {
    filter.$or = [
      { username: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } }
    ];
  }

  // Count total matching documents
  const total = await User.countDocuments(filter);

  // Find students with pagination, lean query, and only required fields
  const students = await User.find(filter)
    .select("name username phone dateOfBirth className")
    .lean()
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  return res.status(200).json({
    status: 200,
    message: "Students retrieved successfully",
    data: { students, total, page: Number(page), limit: Number(limit) }
  });
});

const showTeacher = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;
  console.log("Received schoolId:", schoolId);
  const teachers = await User.find({ schoolId: schoolId, role: "teacher" });
  return res
    .status(200)
    .json(new ApiResponse(200, { teachers }, "Teachers retrieved successfully"));
});

export { addStudent, schoolAdminLogin, addTeacher, showStudents, showTeacher };
