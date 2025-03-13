import { asyncHandler } from "../utils/asyncHandler.js";

import Paper from "../models/createExam.models.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * assignPaper - Controller to create (assign) a new exam paper.
 * Expects the following fields in the request body:
 * - subject, examName, topic, subTopic, totalMarks
 * - school (ID of the school conducting the exam)
 * - createdBy (ID of the user/teacher assigning the paper)
 */
export const assignPaper = asyncHandler(async (req, res) => {
  const { subject, examName, topic, subTopic, totalMarks, school, createdBy } = req.body;

  // Validate required fields
  if (!subject || !examName || !topic || !subTopic || !totalMarks || !school || !createdBy) {
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
  });

  res.status(201).json({
    status: 201,
    message: "Paper assigned successfully",
    data: paper,
  });
});

/**
 * getPapers - Controller to retrieve exam papers.
 * Optionally filters by school or creator (teacher) using query parameters.
 * Query params: school (schoolId), createdBy (userId)
 */
export const getPapers = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.school) {
    filter.school = req.query.school;
  }
  if (req.query.createdBy) {
    filter.createdBy = req.query.createdBy;
  }

  const papers = await Paper.find(filter)
    .populate("school", "name subdomain")
    .populate("createdBy", "username role")
    .populate("results.student", "username name");

  res.status(200).json({
    status: 200,
    message: "Papers fetched successfully",
    data: papers,
  });
});

/**
 * updatePaper - Controller to update an existing exam paper.
 * It can update exam details and/or add/update student results.
 * Expects the paper ID in req.params.id and update data in req.body.
 */
export const updatePaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const paper = await Paper.findByIdAndUpdate(id, updateData, { new: true });
  if (!paper) {
    throw new ApiError(404, "Paper not found");
  }

  res.status(200).json({
    status: 200,
    message: "Paper updated successfully",
    data: paper,
  });
});
