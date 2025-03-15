// controllers/class.controllers.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Class from "../models/Class.js";
import ApiError from "../utils/ApiError.js";

export const getStudentsByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const classData = await Class.findById(classId);
  if (!classData) {
    throw new ApiError(404, "Class not found");
  }

  // If each Student (User) has a `classId` field
  const students = await User.find({ classId, role: "student" });
  
  res.status(200).json({
    status: 200,
    message: "Students fetched successfully",
    data: students,
  });
});
