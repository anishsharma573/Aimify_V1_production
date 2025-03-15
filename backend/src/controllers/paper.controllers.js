// controllers/paper.controllers.js
import Paper from "../models/createExam.models.js"
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
export const assignPaper = asyncHandler(async (req, res) => {
  const {
    subject,
    examName,
    topic,
    subTopic,
    totalMarks,
    school,
    createdBy,
    className, // <-- storing class as a string
  } = req.body;

  // Validate required fields
  if (
    !subject ||
    !examName ||
    !topic ||
    !subTopic ||
    !totalMarks ||
    !school ||
    !createdBy ||
    !className
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  // Create a new exam paper
  const paper = await Paper.create({
    subject,
    examName,
    topic,
    subTopic,
    totalMarks,
    school,
    createdBy,
    className,
  });

  res.status(201).json({
    status: 201,
    message: "Paper assigned successfully",
    data: paper,
  });
});


// controllers/paper.controllers.js (add this export)
export const getExamsByClass = asyncHandler(async (req, res) => {
  const { className } = req.params;
 
  const exams = await Paper.find({ className });
  res.status(200).json({
    status: 200,
    message: "Exams fetched successfully",
    data: exams,
  });
});


// controllers/user.controllers.js


export const getStudentsByClass = asyncHandler(async (req, res) => {
  const { className } = req.params;
  // Fetch users with role 'student' and matching className
  const students = await User.find({ className, role: "student" });
  res.status(200).json({
    status: 200,
    message: "Students fetched successfully",
    data: students,
  });
});


// controllers/paper.controllers.js (add this export)
export const updateExamMarks = asyncHandler(async (req, res) => {
  const { paperId } = req.params;
  const { results } = req.body;

  // Validate that results is provided as an array.
  if (!results || !Array.isArray(results)) {
    throw new ApiError(400, "Results must be provided as an array");
  }

  // Find the paper by its ID.
  const paper = await Paper.findById(paperId);
  if (!paper) {
    throw new ApiError(404, "Paper not found");
  }

  // Loop through each new result and update or add the marks.
  results.forEach((newResult) => {
    // Look for an existing result for this student.
    const index = paper.results.findIndex(
      (r) => r.student.toString() === newResult.student
    );

    if (index > -1) {
      // Update marks if record exists.
      paper.results[index].marksObtained = newResult.marksObtained;
    } else {
      // Otherwise, add a new result.
      paper.results.push(newResult);
    }
  });

  // Save the updated paper document.
  await paper.save();

  res.status(200).json({
    status: 200,
    message: "Exam marks updated successfully",
    data: paper,
  });
});


